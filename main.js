import { updateCanvasPreview } from "./canvasBuilder.js";
import { state, stepIDs, doorStyles, patioDoorSizeLimits } from "./data.js";
import { updateConfigurationOptionVisibility } from './ui.js';

/*
   ---------------------------------------------
   Step Navigation & UI
   ---------------------------------------------
*/
function updateNavigationControls() {
  // No back/next buttons — nothing to update
}

function isStepAccessible(index) {
  return true;
}

function updateStepMenuAccessibility() {
  document.querySelectorAll(".step-menu-item").forEach(item => {
    item.classList.remove("disabled");
  });
}

function showStep(index) {
  // Hide every step, then reveal only the active one
  stepIDs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  const activeStep = document.getElementById(stepIDs[index]);
  if (activeStep) activeStep.style.display = "block";
  updateStepMenu(index);
}

function updateStepMenu(idx) {
  document.querySelectorAll(".step-menu-item").forEach((item, i) => {
    item.classList.toggle("active", i === idx);
  });
}

function goToNextStep() {}
function goToPreviousStep() {}

export {
  goToNextStep,
  goToPreviousStep,
  showStep,
  updateNavigationControls,
  updateStepMenuAccessibility,
  isStepAccessible
}
function validateDoorDimensionInput(inputId, dimensionType) {
  const input = document.getElementById(inputId);
  input.addEventListener("change", () => {
    let min, max;
    if (state.doorType === "patio") {
      const limits = patioDoorSizeLimits[state.selectedConfiguration] || patioDoorSizeLimits["patio-2-right"];
      min = dimensionType === "width" ? limits.minWidth : limits.minHeight;
      max = dimensionType === "width" ? limits.maxWidth : limits.maxHeight;
    } else {
      const style = doorStyles.find((s) => s.name === state.selectedStyle);
      if (!style) return;
      min = dimensionType === "width" ? style.minWidth : style.minHeight;
      max = dimensionType === "width" ? style.maxWidth : style.maxHeight;
    }

    let value = parseInt(input.value);
    if (isNaN(value)) return;

    // Clamp to nearest limit if out of bounds
    if (value < min) value = min;
    if (value > max) value = max;

    input.value = value; // update visible input box
    updateCanvasPreview();
  });
}

["doorWidthInput", "doorHeightInput"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("change", () => {
      updateCanvasPreview();
    });
  }
});

validateDoorDimensionInput("doorWidthInput", "width");
validateDoorDimensionInput("doorHeightInput", "height");
document.getElementById("leftSidescreenWidthInput").addEventListener("change", updateCanvasPreview);
document.getElementById("rightSidescreenWidthInput").addEventListener("change", updateCanvasPreview);
document.getElementById("fanLightHeightInput")?.addEventListener("change", updateCanvasPreview);

document.addEventListener("DOMContentLoaded", () => {
  updateConfigurationOptionVisibility(); // <-- ensures inputs and steps match default config
});