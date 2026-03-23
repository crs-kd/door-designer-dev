// panelBaseBuilder.js
import { loadImage, getImageURL } from "./utils.js";

/**
 * Procedurally draws groove lines onto an existing canvas context.
 * Loads groove.png and tiles it inside the inner panel area.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width   - Total panel width in px
 * @param {number} height  - Total panel height in px
 * @param {Object} textureDef - Entry from textureDefs ({ id, count, marginX, marginY })
 */
export async function drawGrooves(ctx, width, height, textureDef) {
  if (!textureDef || textureDef.id === "none") return;

  const grooveImg = await loadImage(getImageURL("groove"));
  if (!grooveImg) return;

  const count   = textureDef.count   ?? 6;
  const marginX = textureDef.marginX ?? 35;
  const marginY = textureDef.marginY ?? 35;

  const innerW = width  - marginX * 2;
  const innerH = height - marginY * 2;
  const nW = grooveImg.naturalWidth;
  const nH = grooveImg.naturalHeight;

  ctx.globalCompositeOperation = "multiply";

  if (textureDef.id === "vertical") {
    // Groove runs top-to-bottom.
    // Preserve the image's aspect ratio against the inner height.
    const grooveDrawH = innerH;
    const grooveDrawW = nW * (innerH / nH);
    const sectionW    = innerW / (count + 1);

    for (let i = 1; i <= count; i++) {
      const cx = marginX + i * sectionW;
      ctx.drawImage(grooveImg,
        cx - grooveDrawW / 2, marginY,
        grooveDrawW, grooveDrawH
      );
    }

  } else if (textureDef.id === "horizontal") {
    // Groove runs left-to-right.
    // Rotate the groove image 90° so the line spans horizontally.
    // After ctx.rotate(+90°):  local-x → screen-y,  local-y → screen-x (mirrored)
    // Draw: local-x = groove thickness (screen height), local-y = innerW (screen width).
    const grooveThick = nW * (innerW / nH);  // thickness scales with inner width
    const sectionH    = innerH / (count + 1);

    for (let i = 1; i <= count; i++) {
      const cy = marginY + i * sectionH;
      ctx.save();
      ctx.translate(marginX + innerW / 2, cy);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(grooveImg,
        -grooveThick / 2, -innerW / 2,
        grooveThick, innerW
      );
      ctx.restore();
    }
  }

  ctx.globalCompositeOperation = "source-over";
}

/**
 * Creates a base panel with colour fill, optional woodgrain texture, and
 * optional procedural groove overlay.
 *
 * @param {Object}      config
 * @param {number}      config.width
 * @param {number}      config.height
 * @param {string}      config.baseColor
 * @param {string|null} config.woodTextureURL
 * @param {Object|null} config.grooveTextureDef  - Entry from textureDefs
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
  canvas.width  = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Step 1: Fill base colour
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, width, height);

  // Step 2: Woodgrain texture overlay
  if (woodTextureURL) {
    const woodImg = await loadImage(woodTextureURL);
    if (woodImg) {
      ctx.globalCompositeOperation = "overlay";
      ctx.drawImage(woodImg, 0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  // Step 3: Procedural groove lines
  await drawGrooves(ctx, width, height, grooveTextureDef);

  return canvas;
}
