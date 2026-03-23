
import { imageOverloads, doorStyles, state, stepIDs, patioDoorSizeLimits } from "./data.js";
import { showStep, updateNavigationControls } from "./main.js";

/* 
   ---------------------------------------------
   Utility Functions
   ---------------------------------------------
*/
function getImageURL(filename) {
  const baseURL = "https://crs-kd.github.io/door-designer/";
  const filePart = imageOverloads[filename] ? imageOverloads[filename] : filename;
  if (!filePart) return null;
  return (baseURL + filePart + ".png").toLowerCase();
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image: " + url));
    img.src = url;
  });
}

function tintImage(img, tintColor) {
  const offscreen = document.createElement("canvas");
  offscreen.width = img.width;
  offscreen.height = img.height;
  const ctx = offscreen.getContext("2d");
  ctx.drawImage(img, 0, 0);
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = tintColor;
  ctx.fillRect(0, 0, offscreen.width, offscreen.height);
  ctx.globalCompositeOperation = "source-over";
  return offscreen;
}

function mirrorCanvas(canvas) {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  tempCanvas.getContext("2d").drawImage(canvas, 0, 0);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.restore();
}

function goToNextStep() {
  if (state.currentStep < stepIDs.length - 1) {
    state.currentStep++;
    showStep(state.currentStep);
    updateNavigationControls();
  }
}

function goToPreviousStep() {
  if (state.currentStep > 0) {
    state.currentStep--;
    showStep(state.currentStep);
    updateNavigationControls();
  } else {
    document.getElementById("startScreen").classList.remove("hidden");
    document.querySelector(".door-designer-container").style.display = "none";
  }
}

const RENDER_SCALE = 2;

function getScaledPanelSize(inputWidthMM, inputHeightMM) {
  const baseHeightMM = 1980;
  const baseDisplayHeight = 600 * RENDER_SCALE;
  const scaleFactor = baseDisplayHeight / baseHeightMM;
  return {
    width: Math.round(inputWidthMM * scaleFactor),
    height: Math.round(inputHeightMM * scaleFactor),
    scaleFactor
  };
}

function getClampedSize(inputWidth, inputHeight, minW, maxW, minH, maxH) {
  return {
    width: Math.min(Math.max(inputWidth, minW), maxW),
    height: Math.min(Math.max(inputHeight, minH), maxH)
  };
}

function getDoorPanelDimensionsFromInput() {
  const widthInputEl = document.getElementById("doorWidthInput");
  const heightInputEl = document.getElementById("doorHeightInput");

  let widthInput = parseInt(widthInputEl.value);
  let heightInput = parseInt(heightInputEl.value);

  let minW, maxW, minH, maxH;
  if (state.doorType === "patio") {
    const limits = patioDoorSizeLimits[state.selectedConfiguration] || patioDoorSizeLimits["patio-2-right"];
    minW = limits.minWidth;
    maxW = limits.maxWidth;
    minH = limits.minHeight;
    maxH = limits.maxHeight;
  } else {
    const styleObj = doorStyles.find(s => s.name === state.selectedStyle);
    minW = styleObj?.minWidth || 600;
    maxW = styleObj?.maxWidth || 1200;
    minH = styleObj?.minHeight || 1800;
    maxH = styleObj?.maxHeight || 2200;
  }

  // Clamp values
  widthInput = Math.min(Math.max(widthInput, minW), maxW);
  heightInput = Math.min(Math.max(heightInput, minH), maxH);

  // Write clamped values back to inputs
  widthInputEl.value = widthInput;
  heightInputEl.value = heightInput;

  const scaled = getScaledPanelSize(widthInput, heightInput);
  return {
    inputMM: { width: widthInput, height: heightInput },
    displayPixels: { width: scaled.width, height: scaled.height },
    scaleFactor: scaled.scaleFactor
  };
}

function getSidescreenDimensionsFromInput() {
  const leftWidth = parseInt(document.getElementById("leftSidescreenWidthInput").value);
  const rightWidth = parseInt(document.getElementById("rightSidescreenWidthInput").value);
  const height = parseInt(document.getElementById("doorHeightInput").value); // match door

  const scaled = getScaledPanelSize(1, height); // only height matters
  return {
    left: {
      inputMM: leftWidth,
      displayPixels: Math.round(leftWidth * scaled.scaleFactor)
    },
    right: {
      inputMM: rightWidth,
      displayPixels: Math.round(rightWidth * scaled.scaleFactor)
    },
    displayHeight: scaled.height,
    scaleFactor: scaled.scaleFactor
  };
}

/**
 * Builds a mask canvas that matches the molding shape,
 * so you can use it to cut out areas (e.g., from groove textures).
 *
 * @param {Object} moldDef - The molding definition (must include `elements`)
 * @param {number} width - The panel width (door or sidescreen)
 * @param {number} height - The panel height
 * @returns {HTMLCanvasElement} A canvas where the molding area is filled in white
 */
function buildMoldingMask(moldDef, width, height) {
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;
  const ctx = maskCanvas.getContext("2d");

  if (!moldDef?.elements || !Array.isArray(moldDef.elements)) return maskCanvas;

  ctx.fillStyle = "white";

  for (const el of moldDef.elements) {
    let rect;
    if (el.rect) {
      const r = el.rect;
      const w = r.width === "full" ? width : r.width;
      const x = r.x === "right" ? width - w : r.x ?? 0;
      const y = r.align === "centerY"
        ? (height - r.height) / 2
        : r.y === "bottom"
        ? height - r.height
        : r.y ?? 0;
      rect = { x, y, width: w, height: r.height };
    } else if (el.mixedRect) {
      const m = el.mixedRect;
      rect = {
        x: m.x !== undefined
          ? (m.x === "right" ? width - m.width : m.x)
          : (m.xFactor ?? 0) * width,
        y: m.y !== undefined
          ? (m.y === "bottom" ? height - m.height : m.y)
          : (m.yFactor ?? 0) * height,
        width: m.width ?? (m.widthFactor * width),
        height: m.height ?? (m.heightFactor * height)
      };
    } else {
      continue;
    }

    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  return maskCanvas;
}

export {
  RENDER_SCALE,
  getImageURL,
  loadImage,
  tintImage,
  mirrorCanvas,
  goToNextStep,
  goToPreviousStep,
  getDoorPanelDimensionsFromInput,
  getSidescreenDimensionsFromInput,
  buildMoldingMask
};
