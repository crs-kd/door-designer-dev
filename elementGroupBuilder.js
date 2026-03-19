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
  elements = [],
  mask = null,
}) {
  // Step 1: Create canvas for base color + texture
  const baseCanvas = document.createElement("canvas");
  baseCanvas.width = width;
  baseCanvas.height = height;
  const baseCtx = baseCanvas.getContext("2d");

  // Fill base color
  baseCtx.fillStyle = baseColor;
  baseCtx.fillRect(0, 0, width, height);

  // Optional texture over base
  if (textureURL) {
    const texture = await loadImage(textureURL);
    if (texture) {
      baseCtx.globalCompositeOperation = textureBlend;
      baseCtx.drawImage(texture, 0, 0, width, height);
      baseCtx.globalCompositeOperation = "source-over";
    }
  }

  // Step 2: Create canvas for all elements
  const overlayCanvas = document.createElement("canvas");
  overlayCanvas.width = width;
  overlayCanvas.height = height;
  const overlayCtx = overlayCanvas.getContext("2d");

  for (const el of elements) {
    const rect = resolveElementRect(el, width, height);
    if (!rect) continue;
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