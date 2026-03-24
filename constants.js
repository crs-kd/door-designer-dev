// ── Shared rendering constants ───────────────────────────────────────────────
// No imports here — this file must remain dependency-free so both data.js
// and utils.js can safely import from it without circular references.

export const RENDER_SCALE = 2;

// Frame rail thickness in base pixels (× RENDER_SCALE at runtime).
// Change this single value to scale all frame rails, midrails and glass insets.
export const FRAME_RAIL = 45;
