import { getImageURL } from "./utils.js";
import { addThumbnailClick } from "./canvasBuilder.js";
import {
  doorStyles,
  styleDisplayNames,
  glazingDisplayNames,
  letterplateDisplayNames,
  handleDisplayNames,
  hardwareColorDisplayNames,
  state,
  configurations,
  patioDoorConfigurations,
  hardwareColorOptions,
  handleOptions,
  sidescreenGlazingDefs,
  glazingDefs,
  doorCollections,
  doorRanges,
  rangeCollections,
  finishOptions,
  internalFinishMap,
} from "./data.js";


/*
   ---------------------------------------------
   Summary & UI
   ---------------------------------------------
*/

function toTitleCase(str) {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}
function updateSummary() {
  const styleObj = doorStyles.find(s => s.name === state.selectedStyle);

  const styleText = toTitleCase(styleObj ? (styleDisplayNames[state.selectedStyle] || state.selectedStyle) : "None");
  const glazingName = toTitleCase(glazingDisplayNames[state.selectedGlazing] || state.selectedGlazing || "None");

  // Resolve original letterplate key for display name lookup
  let originalLetterplateKey = "none";
  if (styleObj && state.selectedLetterplate) {
    const entry = Object.entries(styleObj.letterplateOptions || {}).find(
      ([key, val]) => val === state.selectedLetterplate
    );
    originalLetterplateKey = entry ? entry[0] : state.selectedLetterplate;
  }

  const letterplateText = toTitleCase(
    letterplateDisplayNames[originalLetterplateKey] || originalLetterplateKey
  );

  const handleText = toTitleCase(
    handleDisplayNames[state.selectedHandle] || state.selectedHandle || "None"
  );

  const externalColour = toTitleCase(state.selectedExternalFinish || "None");
  const internalColour = toTitleCase(state.selectedInternalFinish || "None");
  const hardwareColour = toTitleCase(state.selectedHardwareColor || "None");

  document.getElementById("summary").innerHTML =
    `<strong>Style:</strong> ${styleText} | ` +
    `<strong>Glazing:</strong> ${glazingName} | ` +
    `<strong>External Colour:</strong> ${externalColour} | ` +
    `<strong>Internal Colour:</strong> ${internalColour} | ` +
    `<strong>Hardware Colour:</strong> ${hardwareColour} | ` +
    `<strong>Letterplate:</strong> ${letterplateText} | ` +
    `<strong>Handle:</strong> ${handleText}`;
}

function updateViewIndicator() {
  document.getElementById("currentViewText").textContent =
    "Current View: " + (state.currentView === "external" ? "External" : "Internal");
}

function updateConfigurationOptionVisibility() {
  const leftInputWrapper = document.getElementById("leftSidescreenWidthInput")?.closest(".size-input");
  const rightInputWrapper = document.getElementById("rightSidescreenWidthInput")?.closest(".size-input");
  const fanlightInputWrapper = document.getElementById("fanLightHeightInput")?.closest(".size-input");

  const sidescreenStyleStep = document.getElementById("step-sidescreenStyle");

  const sidescreenStyleMenu = document.getElementById("sidescreenMenuItem");

  // Patio doors never have sidescreens or fanlights
  if (state.doorType === "patio") {
    if (leftInputWrapper) leftInputWrapper.style.display = "none";
    if (rightInputWrapper) rightInputWrapper.style.display = "none";
    if (fanlightInputWrapper) fanlightInputWrapper.style.display = "none";
    if (sidescreenStyleStep) sidescreenStyleStep.style.display = "none";
    if (sidescreenStyleMenu) sidescreenStyleMenu.style.display = "none";
    return;
  }

  const config = state.selectedConfiguration;

  const showLeft = config.includes("left");
  const showRight = config.includes("right");
  const hasFanlight = config.includes("fanlight");
  const hasSidescreen = showLeft || showRight;
  

  // Input visibility
  if (leftInputWrapper) leftInputWrapper.style.display = showLeft ? "flex" : "none";
  if (rightInputWrapper) rightInputWrapper.style.display = showRight ? "flex" : "none";
  if (fanlightInputWrapper) fanlightInputWrapper.style.display = hasFanlight ? "flex" : "none";

  // Step section visibility
  if (sidescreenStyleStep) sidescreenStyleStep.style.display = hasSidescreen ? "block" : "none";

  // Step menu visibility
  if (sidescreenStyleMenu) sidescreenStyleMenu.style.display = hasSidescreen ? "inline-block" : "none";

  // Redirect if current step is sidescreen but it's now hidden
  if (!hasSidescreen && state.currentStep === 1) {
    state.currentStep = 0;
    showStep(state.currentStep);
  }
}
/*
   ---------------------------------------------
   Populate Thumbnails
   ---------------------------------------------
*/


function populateRangeThumbnails() {
  const container = document.getElementById("range-list");
  if (!container) return;
  let html = `<div class="grid-container">`;
  doorRanges.forEach(range => {
    html += `
      <div class="thumbnail" data-type="range" data-value="${range}">
        <img src="${getImageURL(range.toLowerCase() + '-thumb')}" alt="${range}"
             onerror="this.onerror=null;this.src='${getImageURL('placeholder-thumb')}'">
        <p>${range}</p>
      </div>`;
  });
  html += `</div>`;
  container.innerHTML = html;
  addThumbnailClick("range");
  container.querySelectorAll('.thumbnail[data-type="range"]').forEach(el => {
    el.classList.toggle("selected", el.dataset.value === state.selectedRange);
  });
}

function populateStylesByRange() {
  const container = document.getElementById("style-list");
  const collections = rangeCollections[state.selectedRange] ?? [];
  const filtered    = doorStyles.filter(s => s.range === state.selectedRange);
  const grouped     = {};
  collections.forEach(c => { grouped[c] = filtered.filter(s => s.collection === c); });

  const activeCol = state.selectedCollection; // null = show all

  // ── Collection filter pills ───────────────────────────────────────────────
  let html = `<div class="collection-filter">
    <button class="collection-pill${activeCol === null ? ' active' : ''}" data-collection="all">All</button>`;
  collections.forEach(col => {
    if ((grouped[col] ?? []).length > 0) {
      html += `<button class="collection-pill${activeCol === col ? ' active' : ''}" data-collection="${col}">${col}</button>`;
    }
  });
  html += `</div>`;

  // ── Styles (filtered by active collection or all) ─────────────────────────
  const displayCols = activeCol ? [activeCol] : collections;
  displayCols.forEach(col => {
    if ((grouped[col] ?? []).length > 0) {
      html += `<h3 class="collection-title">${col}</h3><div class="grid-container">`;
      grouped[col].forEach(st => {
        const disp = styleDisplayNames[st.name] || st.name;
        html += `
          <div class="thumbnail start-thumb" data-type="style" data-value="${st.name}">
            <img src="${getImageURL(st.name + '-thumb')}" alt="${disp}">
            <p>${disp}</p>
          </div>`;
      });
      html += `</div>`;
    }
  });

  container.innerHTML = html;

  // Collection pill clicks
  container.querySelectorAll('.collection-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedCollection = btn.dataset.collection === 'all' ? null : btn.dataset.collection;
      populateStylesByRange();
    });
  });

  addThumbnailClick("style");
}

function populateConfigurationOptions() {
  const container = document.getElementById("configuration-list");
  const configList = state.doorType === "patio" ? patioDoorConfigurations : configurations;
  container.innerHTML = configList.map(cfg => `
    <div class="thumbnail" data-type="configuration" data-value="${cfg.value}">
      <img src="${getImageURL(cfg.value)}" alt="${cfg.name}" onerror="this.onerror=null; this.src='${getImageURL('placeholder-thumb')}'">
      <p>${cfg.name}</p>
    </div>
  `).join("");
  addThumbnailClick("configuration");
}

function populateSidescreenStyleThumbnails() {
  const container = document.getElementById("sidescreen-style-list");
  const styleObj = doorStyles.find(s => s.name === state.selectedStyle);
  const sidescreenStyles = styleObj?.sidescreenOptions || ["solid"];

  const html = sidescreenStyles.map(val => `
    <div class="thumbnail" data-type="sidescreenStyle" data-value="${val}">
      <img src="${getImageURL(val + "-sidescreen-thumb")}" alt="${val}">
      <p>${val === "match-door-style" ? (styleDisplayNames[state.selectedStyle] || state.selectedStyle) : val}</p>
    </div>
  `).join("");

  container.innerHTML = html;
  addThumbnailClick("sidescreenStyle");
}

function populateExternalFinishThumbnails() {
  const container = document.getElementById("external-finish-list");
  const selectedRange = state.selectedRange;
  const filteredFinishes = finishOptions.filter(f => f.ranges.includes(selectedRange));

  const html = filteredFinishes.map(f => `
    <div class="thumbnail" data-type="externalColour" data-value="${f.name}">
      <img src="${getImageURL(f.name + "-thumb")}" alt="${f.displayName}">
      <p>${f.displayName}</p>
    </div>
  `).join("");

  container.innerHTML = `<h3 class="collection-title">External Colour</h3>${html}`;
  addThumbnailClick("externalColour");
}

function populateInternalFinishThumbnails() {
  const container = document.getElementById("internal-finish-list");
  const selectedExternal = state.selectedExternalFinish;
  const allowedInternals = internalFinishMap[selectedExternal] || [];

  const html = finishOptions
    .filter(f => allowedInternals.includes(f.name))
    .map(f => `
      <div class="thumbnail" data-type="internalColour" data-value="${f.name}">
        <img src="${getImageURL(f.name + "-thumb")}" alt="${f.displayName}">
        <p>${f.displayName}</p>
      </div>
    `).join("");

  container.innerHTML = `<h3 class="collection-title">Internal Colour</h3>${html}`;
  addThumbnailClick("internalColour");
}


function populateGlazingThumbnails() {
  const container = document.getElementById("glazing-list");
  if (!container) return;

  container.innerHTML = "";

  const styleObj = doorStyles.find(s => s.name === state.selectedStyle);
  const allowedGlazingIds = styleObj?.glazingOptions || [];

  // --- Door Glazing ---
  if (allowedGlazingIds.length > 0) {
    const doorHeader = document.createElement("h3");
    doorHeader.className = "collection-title";
    doorHeader.textContent = "Door Glazing";
    container.appendChild(doorHeader);

    const doorGlazingHTML = allowedGlazingIds.map(id => {
      const def = glazingDefs.find(g => g.id === id);
      if (!def) return "";
      return `
        <div class="thumbnail" data-type="glazing" data-value="${def.id}">
          <img src="${getImageURL(def.image)}" alt="${def.id}">
          <p>${glazingDisplayNames[def.id] || def.id}</p>
        </div>
      `;
    }).join("");
    container.innerHTML += doorGlazingHTML;
  }

  // --- Sidescreen / Fanlight Glazing ---
  const ssHeader = document.createElement("h3");
  ssHeader.className = "collection-title";
  ssHeader.textContent = "Sidescreen / Fanlight Glazing";
  container.appendChild(ssHeader);

  const ssGlazingHTML = sidescreenGlazingDefs.map(def => `
    <div class="thumbnail" data-type="sidescreenGlazing" data-value="${def.id}">
      <img src="${getImageURL(def.image)}" alt="${def.id}">
      <p>${glazingDisplayNames[def.id] || def.id}</p>
    </div>
  `).join("");
  container.innerHTML += ssGlazingHTML;

  addThumbnailClick("glazing");
  addThumbnailClick("sidescreenGlazing");
}

function populateLetterplateThumbnails() {
  const section   = document.getElementById("letterplate-section");
  const container = document.getElementById("letterplate-list");

  if (state.doorType === "patio") {
    if (section) section.style.display = "none";
    container.innerHTML = "";
    return;
  }
  if (section) section.style.display = "";

  const styleObj = doorStyles.find(s => s.name === state.selectedStyle);
  if (!styleObj || !styleObj.letterplateOptions) {
    container.innerHTML = "";
    return;
  }

  const entries = Object.entries(styleObj.letterplateOptions);
  let html = "";
  entries.forEach(([key, actualId]) => {
    html += `
      <div class="thumbnail" data-type="letterplate" data-value="${actualId}">
        <img src="${getImageURL(key + "-thumb")}" alt="${key}">
        <p>${letterplateDisplayNames[key] || key}</p>
      </div>
    `;
  });

  container.innerHTML = html;
  addThumbnailClick("letterplate");

}

function populateHardwareColorThumbnails() {
  const container = document.getElementById("hardware-colour-list");
  container.innerHTML = hardwareColorOptions.map(c => `
    <div class="thumbnail" data-type="hardwareColour" data-value="${c}">
      <img src="${getImageURL(c + "-hardware")}" alt="${hardwareColorDisplayNames[c]}">
      <p>${hardwareColorDisplayNames[c]}</p>
    </div>
  `).join("");
  addThumbnailClick("hardwareColour");
}

function populateHandleThumbnails() {
  const container = document.getElementById("handle-list");

  if (state.doorType === "patio") {
    container.innerHTML = `
      <div class="thumbnail selected" data-type="handle" data-value="patio">
        <img src="${getImageURL("patio-thumb")}" alt="Patio Handle">
        <p>Patio Handle</p>
      </div>`;
    addThumbnailClick("handle");
    return;
  }

  container.innerHTML = handleOptions.map(h => `
    <div class="thumbnail" data-type="handle" data-value="${h}">
      <img src="${getImageURL(h + "-thumb")}" alt="${handleDisplayNames[h]}">
      <p>${handleDisplayNames[h]}</p>
    </div>
  `).join("");
  addThumbnailClick("handle");
}

export {
  updateSummary,
  updateViewIndicator,
  populateStylesByRange,
  populateRangeThumbnails,
  populateConfigurationOptions,
  populateSidescreenStyleThumbnails,
  populateExternalFinishThumbnails,
  populateInternalFinishThumbnails,
  populateGlazingThumbnails,
  populateLetterplateThumbnails,
  populateHardwareColorThumbnails,
  populateHandleThumbnails,
  updateConfigurationOptionVisibility
};