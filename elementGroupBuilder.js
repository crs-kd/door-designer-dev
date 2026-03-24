// elementGroupBuilder.js
import { loadImage } from "./utils.js";
import { resolveElementRect } from "./rectResolver.js";
import { applyMask } from "./maskUtils.js";

/**
 * Composes a frame or molding block onto its own canvas.
 * Final result is masked to match element shapes if a mask is provided.
 * 
 * @param {Object} config
 * @param {number} config.width - Canvas width
 * @param {number} config.height - Canvas height
 * @param {string} config.baseColor - Fill color
 * @param {string|null} config.textureURL - Optional background texture
 * @param {string} [config.textureBlend="multiply"] - Blend mode for texture
 * @param {Array} config.elements - Frame or molding segments
 * @param {HTMLCanvasElement|null} [config.mask=null] - Optional mask to apply to final result
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function composeElementGroup({
  width,
  height,
  baseColor = "#ccc",
  textureURL = null,
  textureBlend = "overlay",
  textureTileSize = null,   // canvas px per tile; null = stretch to fit
  elements = [],
  mask = null,
}) {
  // Pre-load texture once and build a reusable tiled pattern (or stretched image)
  let textureImg = null;
  let tilePattern = null;
  let tileCanvas  = null;

  if (textureURL) {
    textureImg = await loadImage(textureURL);
    if (textureImg) {
      if (textureTileSize) {
        const scale = textureTileSize / textureImg.naturalWidth;
        const tileW = Math.round(textureImg.naturalWidth  * scale);
        const tileH = Math.round(textureImg.naturalHeight * scale);
        tileCanvas = document.createElement("canvas");
        tileCanvas.width  = tileW;
        tileCanvas.height = tileH;
        tileCanvas.getContext("2d").drawImage(textureImg, 0, 0, tileW, tileH);
      }
    }
  }

  // Helper: draw texture (tiled or stretched) onto a context, clipped to a rect,
  // with an optional rotation (degrees) about the rect centre.
  function drawTexturePatch(ctx, rect, rotation = 0) {
    if (!textureImg) return;
    const cx = rect.x + rect.width  / 2;
    const cy = rect.y + rect.height / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);

    if (tileCanvas) {
      const pat = ctx.createPattern(tileCanvas, "repeat");
      // Offset the pattern so it tiles from the rotated rect centre
      const m = new DOMMatrix();
      m.translateSelf(-tileCanvas.width / 2, -tileCanvas.height / 2);
      pat.setTransform(m);
      ctx.fillStyle = pat;
      // Fill a large enough area to cover the rect after rotation
      const diag = Math.ceil(Math.sqrt(rect.width ** 2 + rect.height ** 2));
      ctx.fillRect(-diag, -diag, diag * 2, diag * 2);
    } else {
      // Stretched fallback: map full image onto rect (relative to rotated centre)
      ctx.drawImage(textureImg, -rect.width / 2, -rect.height / 2, rect.width, rect.height);
    }

    ctx.restore();
  }

  // Step 1: Create canvas for base color + global texture
  const baseCanvas = document.createElement("canvas");
  baseCanvas.width = width;
  baseCanvas.height = height;
  const baseCtx = baseCanvas.getContext("2d");

  // Fill base color
  baseCtx.fillStyle = baseColor;
  baseCtx.fillRect(0, 0, width, height);

  // Global texture (no rotation — covers the whole canvas for elements without textureRotation)
  if (textureImg) {
    baseCtx.globalCompositeOperation = textureBlend;
    drawTexturePatch(baseCtx, { x: 0, y: 0, width, height }, 0);
    baseCtx.globalCompositeOperation = "source-over";
  }

  // Step 2: Create canvas for all elements
  const overlayCanvas = document.createElement("canvas");
  overlayCanvas.width = width;
  overlayCanvas.height = height;
  const overlayCtx = overlayCanvas.getContext("2d");

  for (const el of elements) {
    const rect = resolveElementRect(el, width, height);
    if (!rect) continue;

    // Per-element rotated texture patch (replaces the global texture in this region)
    const texRot = el.options?.textureRotation;
    if (texRot !== undefined && textureImg) {
      // Erase the global texture in this element's rect and redraw it rotated
      baseCtx.clearRect(rect.x, rect.y, rect.width, rect.height);
      baseCtx.fillStyle = baseColor;
      baseCtx.fillRect(rect.x, rect.y, rect.width, rect.height);
      baseCtx.globalCompositeOperation = textureBlend;
      drawTexturePatch(baseCtx, rect, texRot);
      baseCtx.globalCompositeOperation = "source-over";
    }

    const img = await loadImage(el.options?.imageURL);
    if (!img) continue;

    overlayCtx.save();
    overlayCtx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
    if (el.options.rotation) {
      overlayCtx.rotate((el.options.rotation * Math.PI) / 180);
    }
    overlayCtx.scale(
      el.options.flipHorizontal ? -1 : 1,
      el.options.flipVertical ? -1 : 1
    );
    overlayCtx.drawImage(
      img,
      -rect.width / 2,
      -rect.height / 2,
      rect.width,
      rect.height
    );
    overlayCtx.restore();
  }

  // Step 3: Combine base + overlay on a final canvas
  const composited = document.createElement("canvas");
  composited.width = width;
  composited.height = height;
  const compositedCtx = composited.getContext("2d");

  compositedCtx.drawImage(baseCanvas, 0, 0);
  compositedCtx.globalCompositeOperation = "overlay";
  compositedCtx.drawImage(overlayCanvas, 0, 0);
  compositedCtx.globalCompositeOperation = "source-over";

  // Step 4: Apply mask if provided
  if (mask) {
    return applyMask(composited, mask);
  }

  return composited;
}