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
    // Fixed groove geometry — the panel is pre-made so spacing never reflows.
    const grooveSpacing = 34;   // px between groove centres (fixed, ~120 mm at door scale)
    const lipTrim       = 10;    // px trimmed from the bottom for the lip overlay

    const grooveMarginY = marginY * 0.4;
    const grooveStartY  = grooveMarginY;
    const grooveDrawH   = height - grooveMarginY * 2 - lipTrim;
    const grooveDrawW   = nW * (grooveDrawH / nH) * 0.018;

    // Centre the fixed-pitch group within the inner width
    const totalSpan  = (count - 1) * grooveSpacing;
    const firstCentreX = marginX + (innerW - totalSpan) / 2;

    for (let i = 0; i < count; i++) {
      const cx = firstCentreX + i * grooveSpacing;
      ctx.drawImage(grooveImg,
        cx - grooveDrawW / 2, grooveStartY,
        grooveDrawW, grooveDrawH
      );
    }

  } else if (textureDef.id === "horizontal") {
    // Fixed groove geometry — spacing never reflows with panel height.
    const grooveSpacing = 34;   // px between groove centres (matches vertical pitch)

    const grooveMarginX = marginX * 0.4;
    const grooveDrawW   = width - grooveMarginX * 2;  // span full inner width
    const grooveThick   = nW * (innerH / nH) * 0.018;  // same reference as vertical for consistent weight

    // Centre the fixed-pitch group within the inner height
    const totalSpan    = (count - 1) * grooveSpacing;
    const firstCentreY = marginY + (innerH - totalSpan) / 2;

    for (let i = 0; i < count; i++) {
      const cy = firstCentreY + i * grooveSpacing;
      ctx.save();
      ctx.translate(marginX + innerW / 2, cy);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(grooveImg,
        -grooveThick / 2, -grooveDrawW / 2,
        grooveThick, grooveDrawW
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
