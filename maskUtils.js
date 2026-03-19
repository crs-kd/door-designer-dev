// maskUtils.js
export function applyMask(sourceCanvas, maskCanvas) {
    const output = document.createElement("canvas");
    output.width = sourceCanvas.width;
    output.height = sourceCanvas.height;
  
    const outputCtx = output.getContext("2d");
    outputCtx.drawImage(maskCanvas, 0, 0);
    outputCtx.globalCompositeOperation = "source-in";
    outputCtx.drawImage(sourceCanvas, 0, 0);
    outputCtx.globalCompositeOperation = "source-over";
  
    return output;
  }