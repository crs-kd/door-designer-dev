// panelBaseBuilder.js
import { loadImage, getImageURL } from "./utils.js";

/**
 * Creates a base panel with color fill, woodgrain texture, and optional groove texture
 * @param {Object} config
 * @param {number} config.width - Panel width (in pixels)
 * @param {number} config.height - Panel height (in pixels)
 * @param {string} config.baseColor - Fill color
 * @param {string|null} config.woodTextureURL - URL to woodgrain texture (optional)
 * @param {Object|null} config.grooveTextureDef - From textureDefs (optional)
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function createBasePanel({
  width,
  height,
  baseColor = "#ccc",
  woodTextureURL = null,
  grooveTextureDef = null,
}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Step 1: Fill base color
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, width, height);

  // Step 2: Overlay woodgrain texture
  if (woodTextureURL) {
    const woodImg = await loadImage(woodTextureURL);
    if (woodImg) {
      ctx.globalCompositeOperation = "overlay";
      ctx.drawImage(woodImg, 0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  // Step 3: Overlay groove texture
  if (grooveTextureDef?.image) {
    const grooveImg = await loadImage(getImageURL(grooveTextureDef.image));
    if (grooveImg) {
      const marginX = grooveTextureDef.marginX ?? 0;
      const marginY = grooveTextureDef.marginY ?? 0;
      const offsetX = grooveTextureDef.offsetX ?? 0;
      const offsetY = grooveTextureDef.offsetY ?? 0;

      const gw = width - marginX * 2;
      const gh = height - marginY * 2;
      const gx = marginX + offsetX;
      const gy = marginY + offsetY;

      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(grooveImg, gx, gy, gw, gh);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  return canvas;
}