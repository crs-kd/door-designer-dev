import { updateCanvasPreview } from "./canvasBuilder.js";
import { state, stepIDs, doorStyles, patioDoorSizeLimits } from "./data.js";
import { updateConfigurationOptionVisibility } from './ui.js';

/*
   ---------------------------------------------
   Step Navigation & UI
   ---------------------------------------------
*/
function updateNavigationControls() {
  const nextBtn = document.getElementById("nextBtn");
  if (state.currentStep === stepIDs.length - 1) {
    nextBtn.disabled = true;
    nextBtn.style.opacity = 0.4;
  } else {
    nextBtn.disabled = !state.stepsCompleted[state.currentStep];
    nextBtn.style.opacity = state.stepsCompleted[state.currentStep] ? 1 : 0.4;
  }
  updateStepMenuAccessibility();
}


function isStepAccessible(index) {
  return true; // or apply logic if you want them in strict order
}

function updateStepMenuAccessibility() {
  document.querySelectorAll(".step-menu-item").forEach((item, index) => {
    if (!isStepAccessible(index) && index !== state.currentStep) {
      item.classList.add("disabled");
    } else {
      item.classList.remove("disabled");
    }
  });
}

function showStep(index) {
  document.querySelectorAll(".step").forEach(s => s.classList.remove("step-active"));
  const activeStep = document.getElementById(stepIDs[index]);
  if (activeStep) activeStep.classList.add("step-active");

  // Scroll thumbnail menu to top
  const thumbContainer = document.querySelector(".thumbnail-container");
  if (thumbContainer) thumbContainer.scrollTop = 0;

  updateStepMenu(index);
}

function updateStepMenu(idx) {
  document.querySelectorAll(".step-menu-item").forEach((item, i) => {
    item.classList.toggle("active", i === idx);
  });
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