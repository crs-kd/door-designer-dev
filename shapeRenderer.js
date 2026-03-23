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
 * Draws a rectangular frame whose inner top edge is a semicircular arch.
 *
 * shape params:
 *   thickness  (mm) — rail width on sides and bottom
 *   archHeight (mm) — y-position of the arch spring line from the top of the block
 *                     (defaults to a semicircle: archHeight = innerWidth / 2)
 */
async function _drawArchFrame(ctx, w, h, shape, finish) {
  const t  = (shape.thickness ?? 30) * mmToPxBase;
  const r  = (w - 2 * t) / 2;          // arch radius = half the inner opening width (px)
  // archHeight (mm) → px.  Default: radius + thickness so the arch peak sits one
  // rail-thickness below the block top, leaving room for the top molding rail.
  const ah = shape.archHeight != null
    ? shape.archHeight * mmToPxBase
    : r + t;
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
  // Opening shape: rectangle (sides + bottom) with a semicircular arch on top.
  // The arch spring line is at y = ah; the arch peak is at y = ah - r.
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.moveTo(t, h - t);                    // bottom-left of opening
  ctx.lineTo(w - t, h - t);               // bottom-right
  ctx.lineTo(w - t, ah);                  // up to right spring of arch
  ctx.arc(cx, ah, r, 0, Math.PI, true);   // arch: right → top → left (anticlockwise = upward)
  ctx.closePath();                         // back to bottom-left
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

  // Arch inner edge: approximate with an arc-clipped shadow strip
  _drawArchInnerShadow(ctx, cx, ah, r, depth);
}

/**
 * Draws a shadow gradient along the inner edge of the arch.
 * Approximated as a ring of canvas strokes (clipped annulus).
 */
function _drawArchInnerShadow(ctx, cx, cy, r, depth) {
  ctx.save();

  // Clip to the arch rail area only (annulus between r and r+depth)
  ctx.beginPath();
  ctx.arc(cx, cy, r + depth, Math.PI, 0, false); // outer arc
  ctx.arc(cx, cy, r,         0, Math.PI, true);  // inner arc (reversed)
  ctx.closePath();
  ctx.clip();

  // Draw shadow using radial gradient centred on the arch
  const grad = ctx.createRadialGradient(cx, cy, r, cx, cy, r + depth);
  grad.addColorStop(0, "rgba(0,0,0,0.22)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(cx - r - depth, cy - r - depth, (r + depth) * 2, r + depth + depth);

  ctx.restore();
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
  const depth = sw * 0.45; // gradient reach within each step

  for (let s = 0; s < steps; s++) {
    const inset = s * sw;
    const sx = inset;
    const sy = inset;
    const bw = w - inset * 2;
    const bh = h - inset * 2;

    const alpha = 0.30 - s * 0.04; // slightly reduce intensity for inner steps

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
