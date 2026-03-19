import { state } from "./data.js";
/*
   ---------------------------------------------
   Visualiser Canvas & Dragging
   (Unchanged from original except adding background upload)
   ---------------------------------------------
*/
let doorOverlayImg = null;
let doorOverlayOffset = { x: 100, y: 100 };
let doorOverlayScale = 1.0;
let doorOverlayDragging = false;
let doorOverlayResizing = false;
let doorOverlayDragStart = { x: 0, y: 0 };
let doorOverlayInitialOffset = { x: 0, y: 0 };
let doorOverlayInitialScale = 1.0;
const resizeHandleSize = 20;
let doorOverlayIsHovering = false;
let initialPinchDistance = null;
let initialPinchScale = null;

function updateDoorOverlayCanvasSize() {
  const visualiserContent = document.getElementById("visualiserContent");
  const rect = visualiserContent.getBoundingClientRect();
  const doorCanvas = document.getElementById("doorOverlayCanvas");
  doorCanvas.width = rect.width;
  doorCanvas.height = rect.height;
}

function updateDoorOverlay() {
  const doorCanvas = document.getElementById("doorOverlayCanvas");
  const doorCtx = doorCanvas.getContext("2d");
  doorCtx.clearRect(0, 0, doorCanvas.width, doorCanvas.height);
  if (!doorOverlayImg) return;
  const width = doorOverlayImg.width * doorOverlayScale;
  const height = doorOverlayImg.height * doorOverlayScale;
  doorCtx.drawImage(doorOverlayImg, doorOverlayOffset.x, doorOverlayOffset.y, width, height);

  if (!("ontouchstart" in window) && doorOverlayIsHovering) {
    doorCtx.strokeStyle = "#4f80ff";
    doorCtx.lineWidth = 2;
    doorCtx.setLineDash([15, 6]);
    doorCtx.strokeRect(doorOverlayOffset.x, doorOverlayOffset.y, width, height);
    doorCtx.fillStyle = "#4f80ff";
    doorCtx.fillRect(
      doorOverlayOffset.x + width - resizeHandleSize, 
      doorOverlayOffset.y + height - resizeHandleSize, 
      resizeHandleSize, 
      resizeHandleSize
    );
  }
}

function initializeDoorOverlay() {
  const previewCanvas = document.getElementById("previewCanvas");
  if (!previewCanvas) return;
  let newImg = new Image();
  newImg.onload = function () {
    if (!doorOverlayImg) {
      const vcRect = document.getElementById("visualiserContent").getBoundingClientRect();
      doorOverlayOffset = { x: (vcRect.width - newImg.width) / 2, y: (vcRect.height - newImg.height) / 2 };
      doorOverlayScale = 1.0;
    }
    doorOverlayImg = newImg;
    updateDoorOverlay();
  };
  newImg.src = previewCanvas.toDataURL("image/png");
}

function updateDoorOverlayImage() {
  let newImg = new Image();
  newImg.onload = function () {
    if (!doorOverlayImg) {
      const vcRect = document.getElementById("visualiserContent").getBoundingClientRect();
      doorOverlayOffset = { x: (vcRect.width - newImg.width) / 2, y: (vcRect.height - newImg.height) / 2 };
      doorOverlayScale = 1.0;
    }
    doorOverlayImg = newImg;
    updateDoorOverlay();
  };
  newImg.src = document.getElementById("previewCanvas").toDataURL("image/png");
}

function updateBackgroundCanvas() {
  const visualiserContent = document.getElementById("visualiserContent");
  const canvas = document.getElementById("bgCanvas");
  const ctx = canvas.getContext("2d");
  const rect = visualiserContent.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (state.backgroundImg) {
    // scale to fill height
    const scaleFactor = canvas.height / state.backgroundImg.height;
    const newWidth = state.backgroundImg.width * scaleFactor;
    const xOffset = (canvas.width - newWidth) / 2;
    ctx.drawImage(state.backgroundImg, xOffset, 0, newWidth, canvas.height);
  }
}

// MOUSE
function doorOverlayMouseDown(e) {
  const canvas = e.target;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (!doorOverlayImg) return;
  const width = doorOverlayImg.width * doorOverlayScale;
  const height = doorOverlayImg.height * doorOverlayScale;
  if (x >= doorOverlayOffset.x && x <= doorOverlayOffset.x + width &&
      y >= doorOverlayOffset.y && y <= doorOverlayOffset.y + height) {
    // bottom-right corner for resizing?
    if (x >= doorOverlayOffset.x + width - resizeHandleSize && x <= doorOverlayOffset.x + width &&
        y >= doorOverlayOffset.y + height - resizeHandleSize && y <= doorOverlayOffset.y + height) {
      doorOverlayResizing = true;
      doorOverlayDragStart = { x, y };
      doorOverlayInitialScale = doorOverlayScale;
    } else {
      doorOverlayDragging = true;
      doorOverlayDragStart = { x, y };
      doorOverlayInitialOffset = { x: doorOverlayOffset.x, y: doorOverlayOffset.y };
    }
  }
}

function doorOverlayMouseMove(e) {
  const canvas = e.target;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (doorOverlayDragging) {
    doorOverlayOffset.x = doorOverlayInitialOffset.x + (x - doorOverlayDragStart.x);
    doorOverlayOffset.y = doorOverlayInitialOffset.y + (y - doorOverlayDragStart.y);
    updateDoorOverlay();
  } else if (doorOverlayResizing) {
    const dx = x - doorOverlayDragStart.x;
    let newScale = doorOverlayInitialScale + dx / doorOverlayImg.width;
    if (newScale < 0.1) newScale = 0.1;
    doorOverlayScale = newScale;
    updateDoorOverlay();
  } else {
    if (!doorOverlayImg) return;
    const width = doorOverlayImg.width * doorOverlayScale;
    const height = doorOverlayImg.height * doorOverlayScale;
    doorOverlayIsHovering = (x >= doorOverlayOffset.x && x <= doorOverlayOffset.x + width &&
                             y >= doorOverlayOffset.y && y <= doorOverlayOffset.y + height);
    updateDoorOverlay();
  }
}

function doorOverlayMouseUp() {
  doorOverlayDragging = false;
  doorOverlayResizing = false;
}

// TOUCH
function doorOverlayTouchStart(e) {
  e.preventDefault();
  const rect = e.target.getBoundingClientRect();
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    if (!doorOverlayImg) return;
    const width = doorOverlayImg.width * doorOverlayScale;
    const height = doorOverlayImg.height * doorOverlayScale;
    if (x >= doorOverlayOffset.x && x <= doorOverlayOffset.x + width &&
        y >= doorOverlayOffset.y && y <= doorOverlayOffset.y + height) {
      // Check corner
      if (x >= doorOverlayOffset.x + width - resizeHandleSize && x <= doorOverlayOffset.x + width &&
          y >= doorOverlayOffset.y + height - resizeHandleSize && y <= doorOverlayOffset.y + height) {
        doorOverlayResizing = true;
      } else {
        doorOverlayDragging = true;
      }
      doorOverlayDragStart = { x, y };
      doorOverlayInitialOffset = { ...doorOverlayOffset };
      doorOverlayInitialScale = doorOverlayScale;
    }
  } else if (e.touches.length === 2) {
    doorOverlayDragging = false;
    doorOverlayResizing = false;
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
    initialPinchScale = doorOverlayScale;
  }
}

function doorOverlayTouchMove(e) {
  e.preventDefault();
  const rect = e.target.getBoundingClientRect();
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    if (doorOverlayDragging) {
      doorOverlayOffset.x = doorOverlayInitialOffset.x + (x - doorOverlayDragStart.x);
      doorOverlayOffset.y = doorOverlayInitialOffset.y + (y - doorOverlayDragStart.y);
      updateDoorOverlay();
    } else if (doorOverlayResizing) {
      const dx = x - doorOverlayDragStart.x;
      let newScale = doorOverlayInitialScale + dx / doorOverlayImg.width;
      if (newScale < 0.1) newScale = 0.1;
      doorOverlayScale = newScale;
      updateDoorOverlay();
    }
  } else if (e.touches.length === 2) {
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (initialPinchDistance) {
      let newScale = initialPinchScale * (dist / initialPinchDistance);
      if (newScale < 0.1) newScale = 0.1;
      doorOverlayScale = newScale;
      updateDoorOverlay();
    }
  }
}

function doorOverlayTouchEnd(e) {
  e.preventDefault();
  if (e.touches.length === 0) {
    doorOverlayDragging = false;
    doorOverlayResizing = false;
    initialPinchDistance = null;
    initialPinchScale = null;
  }
}

function compositeAndSaveVisualiser() {
  let fileName = prompt("Enter a file name for your saved image:", "visualiser-composite.png");
  if (!fileName) fileName = "visualiser-composite.png";
  if (!fileName.toLowerCase().endsWith(".png")) fileName += ".png";

  const visualiserContent = document.getElementById("visualiserContent");
  const w = visualiserContent.clientWidth;
  const h = visualiserContent.clientHeight;

  const compositeCanvas = document.createElement("canvas");
  compositeCanvas.width = w;
  compositeCanvas.height = h;
  const ctx = compositeCanvas.getContext("2d");

  const bgCanvas = document.getElementById("bgCanvas");
  const doorOverlayCanvas = document.getElementById("doorOverlayCanvas");

  ctx.drawImage(bgCanvas, 0, 0, w, h);
  ctx.drawImage(doorOverlayCanvas, 0, 0, w, h);

  const dataURL = compositeCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export {
  compositeAndSaveVisualiser,
  initializeDoorOverlay,
  updateDoorOverlayImage,
  updateDoorOverlay,
  updateDoorOverlayCanvasSize,
  updateBackgroundCanvas,
  doorOverlayMouseDown,            
  doorOverlayMouseMove,
  doorOverlayMouseUp,
  doorOverlayTouchStart,
  doorOverlayTouchMove,
  doorOverlayTouchEnd,
};