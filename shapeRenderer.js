// shapeRenderer.js
//
// Procedural rendering for shape-based molding elements.
// These bypass the image-based composeElementGroup pipeline and draw
// directly onto the final canvas using canvas paths and gradients.
//
// Supported shape types:
//   archFrame   — rectangular frame with a semicircular arched inner top edge
//   raisedPanel — solid block with nested stepped profile gradients
//
import { loadImage, RENDER_SCALE } from "./utils.js";

const mmToPxBase = (600 * RENDER_SCALE) / 1980;

/**
 * Render all shape elements from a moldingDef onto ctx at (moldX, moldY).
 * Called in place of composeElementGroup when a moldingDef contains shape elements.
 *
 * @param {CanvasRenderingContext2D} ctx      - The panel's final canvas context
 * @param {Object}  moldingDef               - The molding definition (from moldingDefs)
 * @param {number}  moldW                    - Molding block width in px (already scaled)
 * @param {number}  moldH                    - Molding block height in px
 * @param {number}  moldX                    - X position on the panel canvas
 * @param {number}  moldY                    - Y position on the panel canvas
 * @param {Object}  finish                   - { color, texture, textureBlend }
 */
export async function drawShapeMolding(ctx, moldingDef, moldW, moldH, moldX, moldY, finish) {
  for (const el of (moldingDef.elements ?? [])) {
    if (!el.shape) continue;

    // Resolve the element rect (widthFactor/heightFactor already applied by caller,
    // so el.rect is already in pixels when this is called from the molding loop).
    const rect = el.rect ?? { x: 0, y: 0, width: moldW, height: moldH };

    const offscreen = document.createElement("canvas");
    offscreen.width  = rect.width;
    offscreen.height = rect.height;
    const oc = offscreen.getContext("2d");

    const { type } = el.shape;

    if (type === "archFrame") {
      await _drawArchFrame(oc, rect.width, rect.height, el.shape, finish);
    } else if (type === "raisedPanel") {
      await _drawRaisedPanel(oc, rect.width, rect.height, el.shape, finish);
    }

    ctx.drawImage(offscreen, moldX + rect.x, moldY + rect.y);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// archFrame
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Draws a rectangular frame whose inner top edge is an arched opening.
 *
 * shape params:
 *   thickness  (mm) — rail width on sides and bottom
 *   archHeight (mm) — y-position of the arch spring line from the top of the block
 *                     (defaults to rx + t so the arch peak sits one rail-width below block top)
 *   archRise   (mm) — vertical rise of the arch from spring line to peak.
 *                     Defaults to rx (circular semicircle). Use a smaller value for a flatter arch.
 */
async function _drawArchFrame(ctx, w, h, shape, finish) {
  const t  = (shape.thickness ?? 30) * mmToPxBase;
  const rx = (w - 2 * t) / 2;          // horizontal radius = half inner opening width (px)

  // archHeight (mm) → px.  Default: rx + t so the arch peak sits one rail-width below block top.
  const ah = shape.archHeight != null
    ? shape.archHeight * mmToPxBase
    : rx + t;

  // archRise (mm) → px.  Vertical rise from spring line to peak.
  // Defaults to rx → circular semicircle.  Use a smaller value for a flatter elliptical arch.
  const ry = shape.archRise != null
    ? shape.archRise * mmToPxBase
    : rx;

  const cx = w / 2;

  // ── 1. Finish fill ──────────────────────────────────────────────────────
  ctx.fillStyle = finish.color || "#ccc";
  ctx.fillRect(0, 0, w, h);

  if (finish.texture) {
    const tex = await loadImage(finish.texture);
    if (tex) {
      ctx.globalCompositeOperation = finish.textureBlend || "overlay";
      ctx.drawImage(tex, 0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  // ── 2. Punch the inner opening (destination-out) ─────────────────────────
  // Opening shape: rectangle (sides + bottom) with an elliptical arch on top.
  // Spring line at y = ah; arch peak at y = ah - ry.
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.moveTo(t, h - t);                              // bottom-left of opening
  ctx.lineTo(w - t, h - t);                          // bottom-right
  ctx.lineTo(w - t, ah);                             // up to right spring (cx + rx, ah)
  ctx.ellipse(cx, ah, rx, ry, 0, 0, Math.PI, true); // arch: right → peak → left (counterclockwise)
  ctx.closePath();                                    // back to bottom-left
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  // ── 3. Profile edge lighting ─────────────────────────────────────────────
  // Simulates a convex molding profile lit from top-left.
  const depth = t * 0.5;  // gradient reach = 50% of rail thickness

  // Outer top edge: bright highlight (faces the light)
  _gradRect(ctx, 0, 0, w, depth,  0, 0, 0, depth,  "rgba(255,255,255,0.30)", "rgba(255,255,255,0)");

  // Outer left edge: bright highlight
  _gradRect(ctx, 0, 0, depth, h,  0, 0, depth, 0,  "rgba(255,255,255,0.22)", "rgba(255,255,255,0)");

  // Inner bottom-rail top edge: shadow (frame overhang blocks light)
  _gradRect(ctx, t, h - t, w - 2*t, depth,  0, h - t, 0, h - t + depth,  `rgba(0,0,0,0.35)`, "rgba(0,0,0,0)");

  // Inner left-rail right edge: shadow
  _gradRect(ctx, t, ah, depth, h - t - ah,  t, 0, t + depth, 0,  "rgba(0,0,0,0.32)", "rgba(0,0,0,0)");

  // Inner right-rail left edge: subtle counter-shadow
  _gradRect(ctx, w - t - depth, ah, depth, h - t - ah,  w - t - depth, 0, w - t, 0,  "rgba(0,0,0,0)", "rgba(0,0,0,0.18)");

  // Arch inner edge: shadow strip along the inside of the arch
  _drawArchInnerShadow(ctx, cx, ah, rx, ry, depth);

  // ── 4. Extrusion channel profile ────────────────────────────────────────
  // Applies a multi-channel UPVC extrusion gradient to each rail face.
  // source-atop means the gradient only draws on solid (non-transparent) pixels —
  // the punched opening is already transparent so it won't be affected.
  _applyExtrusionProfile(ctx, w, h, t, ah, rx, ry);
}

/**
 * Draws a shadow gradient along the inner edge of the arch (elliptical annulus clip).
 */
function _drawArchInnerShadow(ctx, cx, cy, rx, ry, depth) {
  ctx.save();

  // Clip to the arch rail area — annulus between inner and outer ellipse (top half only)
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx + depth, ry + depth, 0, Math.PI, 0, false); // outer ellipse: left→top→right (clockwise)
  ctx.ellipse(cx, cy, rx,         ry,         0, 0, Math.PI, true);  // inner ellipse: right→top→left (counterclockwise)
  ctx.closePath();
  ctx.clip();

  // Radial gradient approximation (uses smaller of rx/ry as inner radius)
  const rMin = Math.min(rx, ry);
  const grad = ctx.createRadialGradient(cx, cy, rMin, cx, cy, rMin + depth);
  grad.addColorStop(0, "rgba(0,0,0,0.22)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(cx - rx - depth, cy - ry - depth, (rx + depth) * 2, ry + depth * 2);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// Extrusion profile helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Applies a multi-channel UPVC extrusion gradient to each rail face of an arch frame.
 *
 * - Side rails (below arch spring line): linear gradient across the rail width
 * - Bottom rail: linear gradient up the rail height
 * - Arch rail: radial gradient in a scaled coordinate system so it follows the
 *   ellipse exactly. The technique: translate to (cx, ah), scale y by (ry/rx) to
 *   turn the ellipse into a circle, apply a circular radial gradient — on restore
 *   the inverse scale maps the gradient back onto the ellipse correctly.
 *
 * Uses source-atop — only draws on solid (non-transparent) pixels.
 */
function _applyExtrusionProfile(ctx, w, h, t, ah, rx, ry) {
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";

  const nCh = 3;
  const cx  = w / 2;

  // ── Left rail: horizontal gradient across rail width (rectangular portion only) ──
  {
    const g = ctx.createLinearGradient(0, 0, t, 0);
    _channelStops(g, nCh);
    ctx.fillStyle = g;
    ctx.fillRect(0, ah, t, h - ah - t);
  }

  // ── Right rail: mirrored horizontal gradient ──────────────────────────────
  {
    const g = ctx.createLinearGradient(w, 0, w - t, 0);
    _channelStops(g, nCh);
    ctx.fillStyle = g;
    ctx.fillRect(w - t, ah, t, h - ah - t);
  }

  // ── Bottom rail: vertical gradient up the rail height ────────────────────
  {
    const g = ctx.createLinearGradient(0, h, 0, h - t);
    _channelStops(g, nCh);
    ctx.fillStyle = g;
    ctx.fillRect(t, h - t, w - 2 * t, t);
  }

  // ── Arch rail: radial gradient that follows the elliptical curve ──────────
  // We translate to the arch centre and scale y by (ry/rx) so the ellipse (rx, ry)
  // becomes a circle of radius rx.  A circular radial gradient then maps back to
  // an elliptical one that precisely tracks the arch rail thickness.
  {
    ctx.save();
    ctx.translate(cx, ah);
    ctx.scale(1, ry / rx);   // ellipse → circle of radius rx in this space

    // Clip to circular annulus (= elliptical arch annulus in original space)
    ctx.beginPath();
    ctx.arc(0, 0, rx + t, Math.PI, 0, false);  // outer boundary
    ctx.arc(0, 0, rx,     0, Math.PI, true);   // inner boundary (reversed)
    ctx.closePath();
    ctx.clip();

    // Radial channel gradient from inner (rx) to outer (rx + t) edge
    const g = ctx.createRadialGradient(0, 0, rx, 0, 0, rx + t);
    _channelStops(g, nCh);
    ctx.fillStyle = g;
    ctx.fillRect(-(rx + t), -(rx + t), (rx + t) * 2, rx + t * 2);

    ctx.restore();  // undo translate + scale (clip is also released)
  }

  ctx.restore();  // undo source-atop
}

/**
 * Adds colour stops to a gradient to simulate `numChannels` cylindrical ridges.
 * Pattern alternates: shadow → highlight → shadow → highlight → … → shadow
 */
function _channelStops(grad, numChannels) {
  const total = numChannels * 2;
  for (let i = 0; i <= total; i++) {
    const pos = i / total;
    grad.addColorStop(
      pos,
      i % 2 === 0
        ? "rgba(0,0,0,0.20)"          // valley / shadow
        : "rgba(255,255,255,0.26)"    // ridge / highlight
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// raisedPanel
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Draws a solid block with concentric stepped profile gradients to simulate
 * a raised/inset molding panel.
 *
 * shape params:
 *   steps     — number of nested inset steps
 *   stepWidth (mm) — width of each step
 */
async function _drawRaisedPanel(ctx, w, h, shape, finish) {
  const steps    = shape.steps     ?? 2;
  const sw       = (shape.stepWidth ?? 15) * mmToPxBase;

  // ── 1. Finish fill ──────────────────────────────────────────────────────
  ctx.fillStyle = finish.color || "#ccc";
  ctx.fillRect(0, 0, w, h);

  if (finish.texture) {
    const tex = await loadImage(finish.texture);
    if (tex) {
      ctx.globalCompositeOperation = finish.textureBlend || "overlay";
      ctx.drawImage(tex, 0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    }
  }
  ctx.globalCompositeOperation = "source-over";

  // ── 2. Profile gradients for each concentric step ───────────────────────
  // Each step is a rectangle inset by (step index × stepWidth).
  // Top/left edges get a highlight (top-left light source).
  // Bottom/right edges get a shadow.
  const depth = sw * 0.75; // gradient reach within each step

  for (let s = 0; s < steps; s++) {
    const inset = s * sw;
    const sx = inset;
    const sy = inset;
    const bw = w - inset * 2;
    const bh = h - inset * 2;

    const alpha = 0.42 - s * 0.06; // slightly reduce intensity for inner steps

    // Top edge highlight
    _gradRect(ctx, sx, sy, bw, depth,  0, sy, 0, sy + depth,  `rgba(255,255,255,${alpha + 0.05})`, "rgba(255,255,255,0)");
    // Bottom edge shadow
    _gradRect(ctx, sx, sy + bh - depth, bw, depth,  0, sy + bh - depth, 0, sy + bh,  "rgba(0,0,0,0)", `rgba(0,0,0,${alpha})`);
    // Left edge highlight
    _gradRect(ctx, sx, sy, depth, bh,  sx, 0, sx + depth, 0,  `rgba(255,255,255,${alpha})`, "rgba(255,255,255,0)");
    // Right edge shadow
    _gradRect(ctx, sx + bw - depth, sy, depth, bh,  sx + bw - depth, 0, sx + bw, 0,  "rgba(0,0,0,0)", `rgba(0,0,0,${alpha})`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────────────────────

function _gradRect(ctx, x, y, rw, rh, x1, y1, x2, y2, c0, c1) {
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, c0);
  g.addColorStop(1, c1);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, rw, rh);
}
