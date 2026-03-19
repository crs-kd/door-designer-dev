// rectResolver.js
export function resolveElementRect(el, width, height) {
    if (el.rect) {
      const r = el.rect;
      const w = r.width === "full" ? width : r.width;
      const h = r.height === "full" ? height : r.height;
      const x = r.x === "right" ? width - w : r.x ?? 0;
      const y = r.y === "bottom" ? height - h : r.y ?? 0;
      return { x, y, width: w, height: h };
    } else if (el.mixedRect) {
      const m = el.mixedRect;
      return {
        x: m.x !== undefined
          ? (m.x === "right" ? width - m.width : m.x)
          : (m.xFactor ?? 0) * width,
        y: m.y !== undefined
          ? (m.y === "bottom" ? height - m.height : m.y)
          : (m.yFactor ?? 0) * height,
        width: m.width ?? (m.widthFactor * width),
        height: m.height ?? (m.heightFactor * height)
      };
    } else if (el.rectFactor) {
      return {
        x: el.rectFactor.x * width,
        y: el.rectFactor.y * height,
        width: el.rectFactor.width * width,
        height: el.rectFactor.height * height
      };
    }
    return null;
  }