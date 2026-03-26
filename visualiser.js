import { state } from "./data.js";
/*
   ---------------------------------------------
   Visualiser Canvas & Dragging
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
let doorOverlayVisible = true;

// 4-point placement
let fourPointMode = false;
let fourPoints = []; // up to 4 {x,y}: TL, TR, BR, BL
let draggingPointIndex = -1;
let fourPointHovering = false;
const CORNER_LABELS = ["top-left", "top-right", "bottom-right", "bottom-left"];

// ── CSS matrix3d perspective (zero-seam display) ──────────────────────────────
// Computes the 4×4 column-major CSS matrix3d that maps the door canvas
// (0,0)→(w,h) to the four clicked screen points.

function computeMatrix3d(w, h, dst) {
  const [tl, tr, br, bl] = dst;
  function adj(m) {
    return [
      m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
      m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
      m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3],
    ];
  }
  function multmm(a, b) {
    const c = Array(9).fill(0);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        for (let k = 0; k < 3; k++)
          c[3*i+j] += a[3*i+k] * b[3*k+j];
    return c;
  }
  function multmv(m, v) {
    return [
      m[0]*v[0]+m[1]*v[1]+m[2]*v[2],
      m[3]*v[0]+m[4]*v[1]+m[5]*v[2],
      m[6]*v[0]+m[7]*v[1]+m[8]*v[2],
    ];
  }
  function basisToPoints(p1, p2, p3, p4) {
    const m = [p1[0],p2[0],p3[0], p1[1],p2[1],p3[1], 1,1,1];
    const v = multmv(adj(m), [p4[0],p4[1],1]);
    return multmm(m, [v[0],0,0, 0,v[1],0, 0,0,v[2]]);
  }
  const srcM = basisToPoints([0,0],[w,0],[w,h],[0,h]);
  const dstM = basisToPoints([tl.x,tl.y],[tr.x,tr.y],[br.x,br.y],[bl.x,bl.y]);
  const t = multmm(dstM, adj(srcM));
  for (let i = 0; i < 9; i++) t[i] /= t[8];
  // CSS matrix3d is column-major 4×4
  return [
    t[0], t[3], 0, t[6],
    t[1], t[4], 0, t[7],
    0,    0,    1, 0,
    t[2], t[5], 0, t[8],
  ].join(',');
}

// ── Triangle mesh warp (used only for saving at high subdivision) ─────────────

function drawTriangleWarp(ctx, img, p0, t0, p1, t1, p2, t2) {
  const denom = (t1.x-t0.x)*(t2.y-t0.y) - (t2.x-t0.x)*(t1.y-t0.y);
  if (Math.abs(denom) < 1e-10) return;
  const ma = ((p1.x-p0.x)*(t2.y-t0.y) - (p2.x-p0.x)*(t1.y-t0.y)) / denom;
  const mb = ((p1.y-p0.y)*(t2.y-t0.y) - (p2.y-p0.y)*(t1.y-t0.y)) / denom;
  const mc = ((p2.x-p0.x)*(t1.x-t0.x) - (p1.x-p0.x)*(t2.x-t0.x)) / denom;
  const md = ((p2.y-p0.y)*(t1.x-t0.x) - (p1.y-p0.y)*(t2.x-t0.x)) / denom;
  const me = p0.x - ma*t0.x - mc*t0.y;
  const mf = p0.y - mb*t0.x - md*t0.y;
  const BLEED = 0.5;
  const mcx = (p0.x+p1.x+p2.x)/3, mcy = (p0.y+p1.y+p2.y)/3;
  function bleed(p) {
    const dx=p.x-mcx, dy=p.y-mcy, len=Math.sqrt(dx*dx+dy*dy)||1;
    return { x: p.x+(dx/len)*BLEED, y: p.y+(dy/len)*BLEED };
  }
  const b0=bleed(p0), b1=bleed(p1), b2=bleed(p2);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(b0.x,b0.y); ctx.lineTo(b1.x,b1.y); ctx.lineTo(b2.x,b2.y);
  ctx.closePath(); ctx.clip();
  ctx.setTransform(ma,mb,mc,md,me,mf);
  ctx.drawImage(img,0,0);
  ctx.restore();
}

function drawWarpedDoor(ctx, img, corners, subdiv = 100) {
  const [tl,tr,br,bl] = corners;
  const iw = img.width, ih = img.height;
  const bilerp = (u, v) => ({
    x: (1-v)*((1-u)*tl.x + u*tr.x) + v*((1-u)*bl.x + u*br.x),
    y: (1-v)*((1-u)*tl.y + u*tr.y) + v*((1-u)*bl.y + u*br.y),
  });
  for (let row = 0; row < subdiv; row++) {
    for (let col = 0; col < subdiv; col++) {
      const u0=col/subdiv, u1=(col+1)/subdiv;
      const v0=row/subdiv, v1=(row+1)/subdiv;
      const p00=bilerp(u0,v0), p10=bilerp(u1,v0);
      const p01=bilerp(u0,v1), p11=bilerp(u1,v1);
      const t00={x:u0*iw,y:v0*ih}, t10={x:u1*iw,y:v0*ih};
      const t01={x:u0*iw,y:v1*ih}, t11={x:u1*iw,y:v1*ih};
      drawTriangleWarp(ctx,img,p00,t00,p10,t10,p11,t11);
      drawTriangleWarp(ctx,img,p00,t00,p11,t11,p01,t01);
    }
  }
}

// ── Warp canvas helpers ───────────────────────────────────────────────────────

function applyWarpCanvas() {
  if (!doorOverlayImg || !doorOverlayVisible) return;
  const warp = document.getElementById("doorWarpCanvas");
  warp.width  = doorOverlayImg.width;
  warp.height = doorOverlayImg.height;
  warp.getContext("2d").drawImage(doorOverlayImg, 0, 0);
  warp.style.transform = `matrix3d(${computeMatrix3d(warp.width, warp.height, fourPoints)})`;
  warp.style.display = "block";
}

function hideWarpCanvas() {
  const warp = document.getElementById("doorWarpCanvas");
  warp.style.display = "none";
  warp.style.transform = "";
}

// ── 4-point helpers ───────────────────────────────────────────────────────────

function isInsideQuad(x, y, pts) {
  function cross(ax,ay,bx,by,px,py) { return (bx-ax)*(py-ay)-(by-ay)*(px-ax); }
  const [tl,tr,br,bl] = pts;
  let sign = null;
  for (const [a,b] of [[tl,tr],[tr,br],[br,bl],[bl,tl]]) {
    const c = cross(a.x,a.y,b.x,b.y,x,y);
    if (sign===null) sign=Math.sign(c);
    else if (c!==0 && Math.sign(c)!==sign) return false;
  }
  return true;
}

function nearestPointIndex(x, y, threshold=15) {
  return fourPoints.findIndex(pt => {
    const dx=pt.x-x, dy=pt.y-y;
    return Math.sqrt(dx*dx+dy*dy)<threshold;
  });
}

function updateFourPointInstructions() {
  const el = document.getElementById("fourPointInstructions");
  if (!el) return;
  if (!fourPointMode || fourPoints.length >= 4) { el.style.display="none"; return; }
  el.style.display = "block";
  el.textContent = `Click the ${CORNER_LABELS[fourPoints.length]} corner of the door opening (${fourPoints.length+1} of 4)`;
}

function toggleFourPointMode() {
  fourPointMode = !fourPointMode;
  fourPoints = [];
  draggingPointIndex = -1;
  fourPointHovering = false;
  const canvas = document.getElementById("doorOverlayCanvas");
  const btn    = document.getElementById("fourPointBtn");
  if (fourPointMode) {
    canvas.style.cursor = "crosshair";
    if (btn) btn.style.color = "#f29300";
  } else {
    canvas.style.cursor = "";
    if (btn) btn.style.color = "#333";
    hideWarpCanvas();
  }
  updateFourPointInstructions();
  updateDoorOverlay();
}

// ── Canvas size ───────────────────────────────────────────────────────────────

function updateDoorOverlayCanvasSize() {
  const rect = document.getElementById("visualiserContent").getBoundingClientRect();
  const doorCanvas = document.getElementById("doorOverlayCanvas");
  doorCanvas.width  = rect.width;
  doorCanvas.height = rect.height;
}

// ── Visibility toggle ─────────────────────────────────────────────────────────

function toggleDoorVisibility() {
  doorOverlayVisible = !doorOverlayVisible;
  document.getElementById("doorOverlayCanvas").style.visibility = doorOverlayVisible ? "visible" : "hidden";
  document.getElementById("doorWarpCanvas").style.visibility    = doorOverlayVisible ? "visible" : "hidden";
  const openIcon   = document.getElementById("eyeOpenIcon");
  const closedIcon = document.getElementById("eyeClosedIcon");
  if (openIcon)   openIcon.style.display   = doorOverlayVisible ? "none" : "";
  if (closedIcon) closedIcon.style.display = doorOverlayVisible ? "" : "none";
  const btn = document.getElementById("toggleDoorVisibilityBtn");
  if (btn) btn.style.opacity = doorOverlayVisible ? "1" : "0.4";
}

// ── Draw overlay ──────────────────────────────────────────────────────────────

function updateDoorOverlay() {
  const doorCanvas = document.getElementById("doorOverlayCanvas");
  const doorCtx    = doorCanvas.getContext("2d");
  doorCtx.clearRect(0, 0, doorCanvas.width, doorCanvas.height);

  if (!doorOverlayImg || !doorOverlayVisible) {
    hideWarpCanvas();
    return;
  }

  if (fourPointMode && fourPoints.length === 4) {
    // CSS matrix3d handles the door display — doorOverlayCanvas is for markers only
    applyWarpCanvas();
  } else {
    hideWarpCanvas();
    if (!fourPointMode) {
      // Normal drag/scale mode
      const width  = doorOverlayImg.width  * doorOverlayScale;
      const height = doorOverlayImg.height * doorOverlayScale;
      doorCtx.drawImage(doorOverlayImg, doorOverlayOffset.x, doorOverlayOffset.y, width, height);
      if (!("ontouchstart" in window) && doorOverlayIsHovering) {
        doorCtx.strokeStyle = "#f29300";
        doorCtx.lineWidth = 2;
        doorCtx.setLineDash([15, 6]);
        doorCtx.strokeRect(doorOverlayOffset.x, doorOverlayOffset.y, width, height);
        doorCtx.fillStyle = "#f29300";
        doorCtx.fillRect(
          doorOverlayOffset.x + width  - resizeHandleSize,
          doorOverlayOffset.y + height - resizeHandleSize,
          resizeHandleSize, resizeHandleSize
        );
        doorCtx.setLineDash([]);
      }
    } else {
      // Still placing points — ghost
      const width  = doorOverlayImg.width  * doorOverlayScale;
      const height = doorOverlayImg.height * doorOverlayScale;
      doorCtx.globalAlpha = 0.25;
      doorCtx.drawImage(doorOverlayImg, doorOverlayOffset.x, doorOverlayOffset.y, width, height);
      doorCtx.globalAlpha = 1.0;
    }
  }

  // Overlay: dots and outline — while placing, or on hover after placement
  const showOverlay = fourPointMode && fourPoints.length > 0 &&
    (fourPoints.length < 4 || fourPointHovering || draggingPointIndex >= 0);

  if (showOverlay) {
    if (fourPoints.length > 1) {
      doorCtx.beginPath();
      doorCtx.setLineDash([5, 5]);
      doorCtx.strokeStyle = "#f29300";
      doorCtx.lineWidth = 1.5;
      doorCtx.moveTo(fourPoints[0].x, fourPoints[0].y);
      for (let i=1; i<fourPoints.length; i++) doorCtx.lineTo(fourPoints[i].x, fourPoints[i].y);
      if (fourPoints.length===4) doorCtx.lineTo(fourPoints[0].x, fourPoints[0].y);
      doorCtx.stroke();
      doorCtx.setLineDash([]);
    }
    fourPoints.forEach((pt, i) => {
      doorCtx.beginPath();
      doorCtx.arc(pt.x, pt.y, 9, 0, Math.PI*2);
      doorCtx.fillStyle = "#f29300";
      doorCtx.fill();
      doorCtx.fillStyle = "#fff";
      doorCtx.font = "bold 10px sans-serif";
      doorCtx.textAlign = "center";
      doorCtx.textBaseline = "middle";
      doorCtx.fillText(i+1, pt.x, pt.y);
    });
  }
}

// ── Initialise / update image ─────────────────────────────────────────────────

function initializeDoorOverlay() {
  const previewCanvas = document.getElementById("previewCanvas");
  if (!previewCanvas) return;
  let newImg = new Image();
  newImg.onload = function () {
    if (!doorOverlayImg) {
      const vcRect = document.getElementById("visualiserContent").getBoundingClientRect();
      const fitScale = Math.min((vcRect.height*0.75)/newImg.height, (vcRect.width*0.75)/newImg.width);
      doorOverlayScale = fitScale;
      const scaledW = newImg.width*fitScale, scaledH = newImg.height*fitScale;
      doorOverlayOffset = { x:(vcRect.width-scaledW)/2, y:(vcRect.height-scaledH)/2 };
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
      const fitScale = Math.min((vcRect.height*0.75)/newImg.height, (vcRect.width*0.75)/newImg.width);
      doorOverlayScale = fitScale;
      const scaledW = newImg.width*fitScale, scaledH = newImg.height*fitScale;
      doorOverlayOffset = { x:(vcRect.width-scaledW)/2, y:(vcRect.height-scaledH)/2 };
    }
    doorOverlayImg = newImg;
    updateDoorOverlay();
  };
  newImg.src = document.getElementById("previewCanvas").toDataURL("image/png");
}

// ── Background canvas ─────────────────────────────────────────────────────────

function updateBackgroundCanvas() {
  const visualiserContent = document.getElementById("visualiserContent");
  const canvas = document.getElementById("bgCanvas");
  const ctx    = canvas.getContext("2d");
  const rect   = visualiserContent.getBoundingClientRect();
  canvas.width  = rect.width;
  canvas.height = rect.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (state.backgroundImg) {
    const scaleFactor = canvas.height / state.backgroundImg.height;
    const newWidth    = state.backgroundImg.width * scaleFactor;
    const xOffset     = (canvas.width - newWidth) / 2;
    ctx.drawImage(state.backgroundImg, xOffset, 0, newWidth, canvas.height);
  }
}

// ── MOUSE ─────────────────────────────────────────────────────────────────────

function doorOverlayMouseDown(e) {
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (!doorOverlayImg) return;

  if (fourPointMode) {
    const nearIdx = nearestPointIndex(x, y);
    if (nearIdx >= 0) {
      draggingPointIndex = nearIdx;
    } else if (fourPoints.length < 4) {
      fourPoints.push({ x, y });
      updateFourPointInstructions();
      updateDoorOverlay();
    }
    return;
  }

  const width  = doorOverlayImg.width  * doorOverlayScale;
  const height = doorOverlayImg.height * doorOverlayScale;
  if (x>=doorOverlayOffset.x && x<=doorOverlayOffset.x+width &&
      y>=doorOverlayOffset.y && y<=doorOverlayOffset.y+height) {
    if (x>=doorOverlayOffset.x+width-resizeHandleSize &&
        y>=doorOverlayOffset.y+height-resizeHandleSize) {
      doorOverlayResizing = true;
      doorOverlayDragStart = { x, y };
      doorOverlayInitialScale = doorOverlayScale;
    } else {
      doorOverlayDragging = true;
      doorOverlayDragStart = { x, y };
      doorOverlayInitialOffset = { x:doorOverlayOffset.x, y:doorOverlayOffset.y };
    }
  }
}

function doorOverlayMouseMove(e) {
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (fourPointMode) {
    if (draggingPointIndex >= 0) {
      fourPoints[draggingPointIndex] = { x, y };
      if (fourPoints.length === 4) applyWarpCanvas();
      updateDoorOverlay();
    } else {
      const nearIdx = nearestPointIndex(x, y);
      const wasHovering = fourPointHovering;
      fourPointHovering = nearIdx>=0 || (fourPoints.length===4 && isInsideQuad(x,y,fourPoints));
      e.target.style.cursor = nearIdx>=0 ? "grab" : (fourPoints.length<4 ? "crosshair" : "default");
      if (wasHovering !== fourPointHovering) updateDoorOverlay();
    }
    return;
  }

  if (doorOverlayDragging) {
    doorOverlayOffset.x = doorOverlayInitialOffset.x + (x - doorOverlayDragStart.x);
    doorOverlayOffset.y = doorOverlayInitialOffset.y + (y - doorOverlayDragStart.y);
    updateDoorOverlay();
  } else if (doorOverlayResizing) {
    const dx = x - doorOverlayDragStart.x;
    let newScale = doorOverlayInitialScale + dx/doorOverlayImg.width;
    if (newScale < 0.1) newScale = 0.1;
    doorOverlayScale = newScale;
    updateDoorOverlay();
  } else {
    if (!doorOverlayImg) return;
    const width  = doorOverlayImg.width  * doorOverlayScale;
    const height = doorOverlayImg.height * doorOverlayScale;
    doorOverlayIsHovering = (
      x>=doorOverlayOffset.x && x<=doorOverlayOffset.x+width &&
      y>=doorOverlayOffset.y && y<=doorOverlayOffset.y+height
    );
    updateDoorOverlay();
  }
}

function doorOverlayMouseUp() {
  doorOverlayDragging   = false;
  doorOverlayResizing   = false;
  draggingPointIndex    = -1;
}

// ── TOUCH ─────────────────────────────────────────────────────────────────────

function doorOverlayTouchStart(e) {
  e.preventDefault();
  const rect = e.target.getBoundingClientRect();

  if (fourPointMode && e.touches.length === 1) {
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const nearIdx = nearestPointIndex(x, y);
    if (nearIdx >= 0) {
      draggingPointIndex = nearIdx;
    } else if (fourPoints.length < 4) {
      fourPoints.push({ x, y });
      updateFourPointInstructions();
      updateDoorOverlay();
    }
    return;
  }

  if (e.touches.length === 1) {
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    if (!doorOverlayImg) return;
    const width  = doorOverlayImg.width  * doorOverlayScale;
    const height = doorOverlayImg.height * doorOverlayScale;
    if (x>=doorOverlayOffset.x && x<=doorOverlayOffset.x+width &&
        y>=doorOverlayOffset.y && y<=doorOverlayOffset.y+height) {
      if (x>=doorOverlayOffset.x+width-resizeHandleSize &&
          y>=doorOverlayOffset.y+height-resizeHandleSize) {
        doorOverlayResizing = true;
      } else {
        doorOverlayDragging = true;
      }
      doorOverlayDragStart = { x, y };
      doorOverlayInitialOffset = { ...doorOverlayOffset };
      doorOverlayInitialScale  = doorOverlayScale;
    }
  } else if (e.touches.length === 2) {
    doorOverlayDragging = false;
    doorOverlayResizing = false;
    const t1=e.touches[0], t2=e.touches[1];
    const dx=t2.clientX-t1.clientX, dy=t2.clientY-t1.clientY;
    initialPinchDistance = Math.sqrt(dx*dx+dy*dy);
    initialPinchScale    = doorOverlayScale;
  }
}

function doorOverlayTouchMove(e) {
  e.preventDefault();
  const rect = e.target.getBoundingClientRect();

  if (fourPointMode && e.touches.length===1 && draggingPointIndex>=0) {
    const touch = e.touches[0];
    fourPoints[draggingPointIndex] = { x:touch.clientX-rect.left, y:touch.clientY-rect.top };
    if (fourPoints.length===4) applyWarpCanvas();
    updateDoorOverlay();
    return;
  }

  if (e.touches.length === 1) {
    const touch = e.touches[0];
    const x = touch.clientX-rect.left, y = touch.clientY-rect.top;
    if (doorOverlayDragging) {
      doorOverlayOffset.x = doorOverlayInitialOffset.x + (x-doorOverlayDragStart.x);
      doorOverlayOffset.y = doorOverlayInitialOffset.y + (y-doorOverlayDragStart.y);
      updateDoorOverlay();
    } else if (doorOverlayResizing) {
      const dx = x-doorOverlayDragStart.x;
      let newScale = doorOverlayInitialScale + dx/doorOverlayImg.width;
      if (newScale<0.1) newScale=0.1;
      doorOverlayScale = newScale;
      updateDoorOverlay();
    }
  } else if (e.touches.length === 2) {
    const t1=e.touches[0], t2=e.touches[1];
    const dx=t2.clientX-t1.clientX, dy=t2.clientY-t1.clientY;
    const dist = Math.sqrt(dx*dx+dy*dy);
    if (initialPinchDistance) {
      let newScale = initialPinchScale*(dist/initialPinchDistance);
      if (newScale<0.1) newScale=0.1;
      doorOverlayScale = newScale;
      updateDoorOverlay();
    }
  }
}

function doorOverlayTouchEnd(e) {
  e.preventDefault();
  if (e.touches.length === 0) {
    doorOverlayDragging  = false;
    doorOverlayResizing  = false;
    draggingPointIndex   = -1;
    initialPinchDistance = null;
    initialPinchScale    = null;
  }
}

// ── Backward pixel mapping (perspective warp for save) ────────────────────────
// For each output pixel, uses inverse homography to find the source pixel.
// This is used instead of the triangle mesh for the save path to avoid
// Canvas 2D clip/transform edge cases.

function rasterizeWarpedDoor(targetCtx, img, corners) {
  const cw = targetCtx.canvas.width, ch = targetCtx.canvas.height;
  const [tl, tr, br, bl] = corners;
  const iw = img.width, ih = img.height;

  // Build homography: image space (0,0)→(iw,ih) → screen space (corners)
  function adj(m) {
    return [
      m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
      m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
      m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3],
    ];
  }
  function multmm(a, b) {
    const c = Array(9).fill(0);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        for (let k = 0; k < 3; k++)
          c[3*i+j] += a[3*i+k] * b[3*k+j];
    return c;
  }
  function multmv(m, v) {
    return [m[0]*v[0]+m[1]*v[1]+m[2]*v[2], m[3]*v[0]+m[4]*v[1]+m[5]*v[2], m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
  }
  function basisToPoints(p1, p2, p3, p4) {
    const m = [p1[0],p2[0],p3[0], p1[1],p2[1],p3[1], 1,1,1];
    const v = multmv(adj(m), [p4[0],p4[1],1]);
    return multmm(m, [v[0],0,0, 0,v[1],0, 0,0,v[2]]);
  }

  const srcM = basisToPoints([0,0],[iw,0],[iw,ih],[0,ih]);
  const dstM = basisToPoints([tl.x,tl.y],[tr.x,tr.y],[br.x,br.y],[bl.x,bl.y]);
  const t = multmm(dstM, adj(srcM));
  for (let i = 0; i < 9; i++) t[i] /= t[8];

  // Inverse homography: adj(t) maps screen → image space
  const ti = adj(t);

  // Bounding box clamped to canvas
  const minX = Math.max(0, Math.floor(Math.min(tl.x, tr.x, br.x, bl.x)));
  const maxX = Math.min(cw, Math.ceil(Math.max(tl.x, tr.x, br.x, bl.x)));
  const minY = Math.max(0, Math.floor(Math.min(tl.y, tr.y, br.y, bl.y)));
  const maxY = Math.min(ch, Math.ceil(Math.max(tl.y, tr.y, br.y, bl.y)));
  if (maxX <= minX || maxY <= minY) return;

  // Read source pixels from a clean isolated canvas (avoids taint from composite canvas)
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = iw; srcCanvas.height = ih;
  srcCanvas.getContext("2d").drawImage(img, 0, 0);
  const srcData = srcCanvas.getContext("2d").getImageData(0, 0, iw, ih).data;

  // Write into a fresh ImageData — no getImageData on composite canvas needed
  // (getImageData on a tainted canvas throws; putImageData and drawImage are safe)
  const bw = maxX - minX, bh = maxY - minY;
  const outData = new ImageData(bw, bh);
  const pixels  = outData.data;

  for (let oy = minY; oy < maxY; oy++) {
    for (let ox = minX; ox < maxX; ox++) {
      const hw = ti[6]*ox + ti[7]*oy + ti[8];
      if (Math.abs(hw) < 1e-10) continue;
      const sx = (ti[0]*ox + ti[1]*oy + ti[2]) / hw;
      const sy = (ti[3]*ox + ti[4]*oy + ti[5]) / hw;
      if (sx < 0 || sx >= iw || sy < 0 || sy >= ih) continue;

      // Bilinear interpolation
      const x0 = Math.floor(sx), y0 = Math.floor(sy);
      const x1 = Math.min(x0+1, iw-1), y1 = Math.min(y0+1, ih-1);
      const fx = sx-x0, fy = sy-y0;
      const i00 = (y0*iw+x0)*4, i10 = (y0*iw+x1)*4;
      const i01 = (y1*iw+x0)*4, i11 = (y1*iw+x1)*4;
      const pidx = ((oy-minY)*bw + (ox-minX))*4;

      for (let c = 0; c < 4; c++) {
        pixels[pidx+c] = Math.round(
          srcData[i00+c]*(1-fx)*(1-fy) + srcData[i10+c]*fx*(1-fy) +
          srcData[i01+c]*(1-fx)*fy     + srcData[i11+c]*fx*fy
        );
      }
    }
  }

  // Composite via an intermediate canvas so alpha is respected (putImageData bypasses
  // compositing — writing it directly would erase background pixels outside the quad)
  const warpCanvas = document.createElement("canvas");
  warpCanvas.width = cw; warpCanvas.height = ch;
  warpCanvas.getContext("2d").putImageData(outData, minX, minY);
  targetCtx.drawImage(warpCanvas, 0, 0);
}

// ── Save composite ────────────────────────────────────────────────────────────

function compositeAndSaveVisualiser() {
  let fileName = prompt("Enter a file name for your saved image:", "visualiser-composite.png");
  if (!fileName) fileName = "visualiser-composite.png";
  if (!fileName.toLowerCase().endsWith(".png")) fileName += ".png";

  const visualiserContent = document.getElementById("visualiserContent");
  const w = visualiserContent.clientWidth;
  const h = visualiserContent.clientHeight;

  const compositeCanvas = document.createElement("canvas");
  compositeCanvas.width  = w;
  compositeCanvas.height = h;
  const ctx = compositeCanvas.getContext("2d");

  ctx.drawImage(document.getElementById("bgCanvas"), 0, 0, w, h);

  if (fourPointMode && fourPoints.length === 4 && doorOverlayImg && doorOverlayVisible) {
    rasterizeWarpedDoor(ctx, doorOverlayImg, fourPoints);
  } else {
    ctx.drawImage(document.getElementById("doorOverlayCanvas"), 0, 0, w, h);
  }

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
  toggleDoorVisibility,
  toggleFourPointMode,
  doorOverlayMouseDown,
  doorOverlayMouseMove,
  doorOverlayMouseUp,
  doorOverlayTouchStart,
  doorOverlayTouchMove,
  doorOverlayTouchEnd,
};
