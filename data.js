import { getImageURL } from "./utils.js";
/* 
   ---------------------------------------------
   Global Data & Definitions
   ---------------------------------------------
*/

// This object allows you to override certain images by specifying alternative filenames.
// If you don't need overrides, leave it empty.
const imageOverloads = {};

// Door ranges and collections
const doorRanges = ["Lorimer"];
const doorCollections = [
  "Lorimer",
  "Elegance",
  "Allure",
  "Classic",
  "Country",
  "Urban",
];

// doorStyles: each style references a styleAssets object, e.g. { texture, molding }
// We keep letterplateOptions, handleOptions, and an array of glazingOptions.
const doorStyles = [
  {
    range: "Lorimer",
    collection: "Allure",
    name: "berlin",
    minWidth: 733,
    maxWidth: 1000,
    minHeight: 1800,
    maxHeight: 2233,
    styleAssets: {
      texture: "horizontal",
      molding: "short-centre",
    },
    sidescreenOptions: ["full", "midrail"],
    glazingLayout: {
      imageModifier: null,
      width: 175,       
      height: 885,      
      offsetX: 0,
      offsetY: -240,
      align: "center",
      blockAnchor: "centre",
      verticalAlign: "centre", 
    },

    glazingOptions: [
      "clear",
      "adina",
      "eden",
      "graphite",
      "harmony",
      "iris",
      "joy",
      "murano",
      "satin",
      "virtue",
      "digital",
      "contora",
      "charcoal",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-mid": "letterplate-mid-a",
      "letterplate-btm": "letterplate-btm-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "lisbon",
    minWidth: 653,
    maxWidth: 1000,
    minHeight: 2023,
    maxHeight: 2233,
    styleAssets: {
      texture: "vertical",
      molding: "full-centre",
    },
    sidescreenOptions: ["full", "midrail"],
    glazingLayout: {
      imageModifier: "long",
      width: 175,       
      height: 1185,      
      offsetX: 0,
      offsetY: 0,
      align: "center",
      blockAnchor: "centre",
      verticalAlign: "centre", 
    },
    glazingOptions: [
      "clear",
      "eden",
      "graphite",
      "harmony",
      "joy",
      "murano",
      "satin",
      "virtue",
            "digital",
      "contora",
      "charcoal",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-btm": "letterplate-btm-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "madrid",
    minWidth: 870,
    maxWidth: 980,
    minHeight: 1800,
    maxHeight: 2000,
    styleAssets: {
      texture: null,
      molding: "squares-centre",
    },
    sidescreenOptions: ["full", "midrail"],
    glazingLayout: {
      imageModifier: "square",
      width: 265,       
      height: 1275,      
      offsetX: 0,
      offsetY: -90,
      blockAnchor: "centre",         // this defines how the block aligns to the anchor
      verticalAlign: "centre", 
      elements: [
        {
          id: "first-glass",
          rect: { x: 45, y: 45, width: 176, height: 111 }
        },
        {
          id: "second-glass",
          rect: { x: 45, y: 403.33, width: 176, height: 111 }
        },
        {
          id: "third-glass",
          rect: { x: 45, y: 761.67, width: 176, height: 111 }
        },
        {
          id: "forth-glass",
          rect: { x: 45, y: 1120, width: 176, height: 111 }
        },
        
      ]
    },
    glazingOptions: [
      "clear",
      "eden",
      "graphite",
      "harmony",
      "joy",
      "murano",
      "satin",
      "virtue",
            "digital",
      "contora",
      "charcoal",
    ],


    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-btm": "letterplate-btm-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "miami",
    minWidth: 870,
    maxWidth: 980,
    minHeight: 1800,
    maxHeight: 2000,
    styleAssets: {
      texture: "vertical",
      molding: "full-left",
    },
    sidescreenOptions: ["full", "midrail"],
    glazingLayout: {
      imageModifier: "long",
      width: 175,       
      height: 1185,      
      offsetX: 225,
      offsetY: 0,
      align: "left",         // "left" | "center" | "right"
      blockAnchor: "centre", 
      verticalAlign: "centre", 
    },
    glazingOptions: [
      "clear",
      "eden",
      "graphite",
      "harmony",
      "joy",
      "murano",
      "satin",
      "virtue",
            "digital",
      "contora",
      "charcoal",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-btm": "letterplate-btm-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "paris",
    minWidth: 870,
    maxWidth: 980,
    minHeight: 1800,
    maxHeight: 2000,
    styleAssets: {
      texture: "horizontal",
      molding: "full-left",
    },
    sidescreenOptions: ["full", "midrail"],
    glazingLayout: {
      imageModifier: "long",
      width: 175,       
      height: 1185,      
      offsetX: 225,
      offsetY: 0,
      align: "left",         // "left" | "center" | "right"
      blockAnchor: "centre", 
      verticalAlign: "centre", 
    },
    glazingOptions: [
      "clear",
      "eden",
      "graphite",
      "harmony",
      "joy",
      "murano",
      "satin",
      "virtue",
            "digital",
      "contora",
      "charcoal",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-btm": "letterplate-btm-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "rio",
    minWidth: 653,
    maxWidth: 1000,
    minHeight: 2023,
    maxHeight: 2233,
    styleAssets: {
      texture: "horizontal",
      molding: "full-centre",
    },
    sidescreenOptions: ["full", "midrail"],
    glazingLayout: {
      imageModifier: "long",
      width: 175,       
      height: 1185,      
      offsetX: 0,
      offsetY: 0,
      align: "center",         // "left" | "center" | "right"
      blockAnchor: "centre", 
      verticalAlign: "centre", 
    },
    glazingOptions: [
      "clear",
      "eden",
      "graphite",
      "harmony",
      "joy",
      "murano",
      "satin",
      "virtue",
            "digital",
      "contora",
      "charcoal",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-btm": "letterplate-btm-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "sydney",
    minWidth: 653,
    maxWidth: 1000,
    minHeight: 2023,
    maxHeight: 2233,
    styleAssets: {
      texture: null,
      molding: "full-centre",
    },
    sidescreenOptions: ["full", "midrail"],
    glazingLayout: {
      imageModifier: "long",
      width: 175,       
      height: 1185,      
      offsetX: 0,
      offsetY: 0,
      align: "center",         // "left" | "center" | "right"
      blockAnchor: "centre", 
      verticalAlign: "centre", 
    },
    glazingOptions: [
      "clear",
      "eden",
      "graphite",
      "harmony",
      "joy",
      "murano",
      "satin",
      "virtue",
            "digital",
      "contora",
      "charcoal",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-btm": "letterplate-btm-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "tokyo",
    minWidth: 733,
    maxWidth: 1000,
    minHeight: 1800,
    maxHeight: 2233,
    styleAssets: {
      texture: null,
      molding: "short-centre",
    },
    sidescreenOptions: ["full", "midrail"],
    glazingLayout: {
      imageModifier: null,
      width: 175,       
      height: 885,      
      offsetX: 0,
      offsetY: -240,
      align: "center",         // "left" | "center" | "right"
      blockAnchor: "centre", 
      verticalAlign: "centre", 
    },
    glazingOptions: [
      "clear",
      "adina",
      "eden",
      "graphite",
      "harmony",
      "iris",
      "joy",
      "murano",
      "satin",
      "virtue",
            "digital",
      "contora",
      "charcoal",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-mid": "letterplate-mid-A",
      "letterplate-btm": "letterplate-btm-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "venice",
    minWidth: 653,
    maxWidth: 1000,
    minHeight: 2023,
    maxHeight: 2233,
    styleAssets: {
      texture: null,
      molding: "full-right",
    },
    sidescreenOptions: ["full", "midrail"],
    glazingLayout: {
      imageModifier: "long",
      width: 175,       
      height: 1185,      
      offsetX: -225,
      offsetY: 0,
      align: "right",         // "left" | "center" | "right"
      blockAnchor: "centre", 
      verticalAlign: "centre", 
    },
    glazingOptions: [
      "clear",
      "eden",
      "graphite",
      "harmony",
      "joy",
      "murano",
      "satin",
      "virtue",
            "digital",
      "contora",
      "charcoal",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-btm": "letterplate-btm-A",
    },
    handleOptions: ["lever"],
  },
  {
    range: "Lorimer",
    collection: "Allure",
    name: "vienna",
    minWidth: 653,
    maxWidth: 1000,
    minHeight: 2023,
    maxHeight: 2233,
    styleAssets: {
      texture: null,
      molding: "squares-left",
    },
    sidescreenOptions: ["full", "midrail"],
    glazingLayout: {
      imageModifier: "square",
      width: 265,       
      height: 1275,      
      offsetX: 180,
      offsetY: -90,
      align: "left",         // "left" | "center" | "right"
      blockAnchor: "centre", 
      verticalAlign: "centre", 
      elements: [
        {
          id: "first-glass",
          rect: { x: 45, y: 45, width: 176, height: 111 }
        },
        {
          id: "second-glass",
          rect: { x: 45, y: 403.33, width: 176, height: 111 }
        },
        {
          id: "third-glass",
          rect: { x: 45, y: 761.67, width: 176, height: 111 }
        },
        {
          id: "forth-glass",
          rect: { x: 45, y: 1120, width: 176, height: 111 }
        },
        
      ]
    },
    glazingOptions: [
      "clear",
      "eden",
      "graphite",
      "harmony",
      "joy",
      "murano",
      "satin",
      "virtue",
            "digital",
      "contora",
      "charcoal",
    ],
    letterplateOptions: {
      "letterplate-none": "letterplate-none",
      "letterplate-low": "letterplate-low-A",
      "letterplate-btm": "letterplate-btm-A",
    },
    handleOptions: ["lever"],
  },
];

// Configuration choices
const configurations = [
  { value: "single", name: "Single Panel" },
  { value: "single-left", name: "Single panel with left sidescreen" },
  { value: "single-right", name: "Single panel with right sidescreen" },
  { value: "single-left-right", name: "Single panel with left and right sidescreens" },
  { value: "single-fanlight", name: "Single panel with fanlight" },

  // Full-height sidescreens
  { value: "single-leftfull-fanlight", name: "Single panel with left sidescreen and fanlight" },
  { value: "single-rightfull-fanlight", name: "Single panel with right sidescreen and fanlight" },
  { value: "single-leftfull-rightfull-fanlight", name: "Single panel with left and right sidescreen and fanlight" },

  // Fanlight full-width variants
  { value: "single-left-fanlightwide", name: "Single panel with left sidescreen and full width fanlight" },
  { value: "single-right-fanlightwide", name: "Single panel with right sidescreen and full width fanlight" },
  { value: "single-left-right-fanlightwide", name: "Single panel with left and right sidescreen and full width fanlight" }
];

// Patio door configurations
// These configurations define different sliding patio door panel options.
// Each configuration represents a different number of sliding panels.
// Note: Patio doors use the same styling, glazing, and finish options as single doors.
const patioDoorConfigurations = [
  { value: "patio-2-right", name: "2-Panel (Right Opening)" },
  { value: "patio-2-left",  name: "2-Panel (Left Opening)" },
  { value: "patio-3panel",  name: "3-Panel Sliding Door" },
  { value: "patio-4panel",  name: "4-Panel Sliding Door" },
];

// Size limits per patio configuration (overall opening dimensions in mm)
// X = open/sliding panel, O = fixed panel
const patioDoorSizeLimits = {
  "patio-2-right": { minWidth: 1600, maxWidth: 3000, minHeight: 1900, maxHeight: 2400 }, // O|X
  "patio-2-left":  { minWidth: 1600, maxWidth: 3000, minHeight: 1900, maxHeight: 2400 }, // X|O
  "patio-3panel":  { minWidth: 2200, maxWidth: 3700, minHeight: 1900, maxHeight: 2400 }, // O|X|O
  "patio-4panel":  { minWidth: 3000, maxWidth: 4900, minHeight: 1900, maxHeight: 2400 }, // O|X|X|O
};

// Optional display name lookups
const styleDisplayNames = {
  lorimer: "Lorimer",
  berlin: "Berlin",
  lisbon: "Lisbon",
  madrid: "madrid",
  miami: "Miami",
  // Add more if needed
};

const finishOptions = [
  {
    name: "Brilliant White",
    displayName: "Brilliant White",
    color: "rgb(240,240,240)",
    ranges: ["Lorimer", "Allure","Timberluxe"]
  },
  {
    name: "Rosewood",
    displayName: "Rosewood",
    color: "rgb(45, 21, 19)",
    texture: getImageURL("woodgrain"),
    textureBlend: "overlay",
    ranges: ["Lorimer", "Allure","Timberluxe"]
  },
  {
    name: "Golden Oak",
    displayName: "Golden Oak",
    color: "rgb(116, 69, 35)",
    texture: getImageURL("woodgrain"),
    textureBlend: "overlay",
    ranges: ["Lorimer", "Allure","Timberluxe"]
  },
  {
    name: "Anthracite Grey",
    displayName: "Anthracite Grey",
    color: "rgb(69,69,74)",
    textureBlend: "multiply",
    ranges: ["Lorimer", "Allure","Timberluxe"]
  },
  {
    name: "Chartwell Green",
    displayName: "Chartwell Green",
    color: "rgb(165, 194, 172)",
    textureBlend: "multiply",
    ranges: ["Timberluxe"]
  }
];

const internalFinishMap = {
  "Brilliant White": ["Brilliant White"],
  "Rosewood": ["Brilliant White", "Rosewood"],
  "Golden Oak": ["Brilliant White", "Golden Oak"],
  "Anthracite Grey": ["Brilliant White"],
  "Chartwell Green": ["Brilliant White"]
};



// Separate definitions for style-based assets
// 1) Textures
const textureDefs = [
  { id: "none" },
  {
    id: "horizontal",
    count: 17,     // 12 groove lines (pre-made panel, fixed pitch)
    marginX: 35,
    marginY: 35,
  },
  {
    id: "vertical",
    count: 6,
    marginX: 35,
    marginY: 35,
  },
];

// 2) Moldings

const moldingDefs = [
  {
    id: "RD4",
    widthFactor: 1,
    height: 75,
    align: "center",
    verticalAlign: "centre",
    offsetX: 0,
    offsetY: 75,
    mask: false,
    elements: [
      {
        id: "top-transom",
        rect: { x: 0, y: 0, widthFactor: 1, height: 20 },
        options: { imageURL: getImageURL("transom"), flipVertical: false },
      },
      {
        id: "bottom-transom",
        rect: { x: 0, y: "bottom", widthFactor: 1, height: 20 },
        options: { imageURL: getImageURL("transom"), flipVertical: true },
      },
      {
        id: "left-mid-frame",
        rect: { x: 0, y: 0, width: 35, heightFactor: 1 },
        options: { imageURL: getImageURL("frame-y") },
      },
      {
        id: "right-mid-frame",
        rect: { x: "right", y: 0, width: 35, heightFactor: 1 },
        options: { imageURL: getImageURL("frame-y"), flipHorizontal: true },
      },
      {
        id: "left-top-transom-end",
        rect: { x: 0, y: 0, width: 35, height: 20 },
        options: { imageURL: getImageURL("transom-end"), flipVertical: false },
      },
      {
        id: "right-top-transom-end",
        rect: { x: "right", y: 0, width: 35, height: 20 },
        options: { imageURL: getImageURL("transom-end"), flipHorizontal: true },
      },
      {
        id: "left-bottom-transom-end",
        rect: { x: 0, y: "bottom", width: 35, height: 20 },
        options: { imageURL: getImageURL("transom-end"), flipVertical: false },
      },
      {
        id: "right-bottm-transom-end",
        rect: { x: "right", y: "bottom", width: 35, height: 20 },
        options: { imageURL: getImageURL("transom-end"), flipHorizontal: true },
      },
    ],
  },
  {
    id: "short-centre",
    width: 265,
    height: 975,
    align: "center", // "left" | "right" | "center"
    blockAnchor: "centre",         // this defines how the block aligns to the anchor
    verticalAlign: "centre", 
    offsetX: 0,
    offsetY: -240,
    elements: [
      {
        id: "allure-x-top",
        rect: { x: 0, y: 0, widthFactor: 1, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-x-bottom",
        rect: { x: 0, y: "bottom", widthFactor: 1, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, width: 45, yFactor: 0, heightFactor: 1 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", width: 45, yFactor: 0, heightFactor: 1 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: "bottom", width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: "bottom", width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
    ],
  },

  {
    id: "full-centre",
    width: 265,
    height: 1275,
    align: "center", // "left" | "right" | "center"
    blockAnchor: "centre", 
    verticalAlign: "centre", 
    offsetX: 0,
    offsetY: 0,

    
    elements: [
      {
        id: "allure-x-top",
        rect: { x: 0, y: 0, widthFactor: 1, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-x-bottom",
        rect: { x: 0, y: "bottom", widthFactor: 1, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, width: 45, yFactor: 0, heightFactor: 1 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", width: 45, yFactor: 0, heightFactor: 1 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: "bottom", width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: "bottom", width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
    ],
  },

  {
    id: "full-left",
    width: 265,
    height: 1275,
    align: "left",
    blockAnchor: "centre", 
    verticalAlign: "centre", 
    offsetX: 180,
    offsetY: 0,
    elements: [
      {
        id: "allure-x-top",
        rect: { x: 0, y: 0, widthFactor: 1, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-x-bottom",
        rect: { x: 0, y: "bottom", widthFactor: 1, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, width: 45, yFactor: 0, heightFactor: 1 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", width: 45, yFactor: 0, heightFactor: 1 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: "bottom", width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: "bottom", width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
    ],
  },
  {
    id: "full-right",
    width: 265,
    height: 1275,
    align: "right", // "left" | "right" | "center"
    blockAnchor: "centre", 
    verticalAlign: "centre", 
    offsetX: -180,
    offsetY: 0,
    elements: [
      {
        id: "allure-x-top",
        rect: { x: 0, y: 0, widthFactor: 1, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-x-bottom",
        rect: { x: 0, y: "bottom", widthFactor: 1, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, width: 45, yFactor: 0, heightFactor: 1 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", width: 45, yFactor: 0, heightFactor: 1 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: "bottom", width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: "bottom", width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
    ],
  },

  {
    id: "squares-centre",
    width: 265,
    height: 1275,
    align: "centre", // "left" | "right" | "center"
    blockAnchor: "centre", 
    verticalAlign: "centre", 
    offsetY: -90,
    elements: [
      // First
      {
        id: "allure-x-top",
        rect: { x: 0, y: 0, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-x-bottom",
        rect: { x: 0, y: 155, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, y:0,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", y:0,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: 155, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: 155, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      // Second
      {
        id: "allure-x-top",
        rect: { x: 0, y: 358.33, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
        {
        id: "allure-x-bottom",
        rect: { x: 0, y: 513.33, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, y:358.33,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", y:358.33,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 358.33, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 358.33, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: 513.33, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: 513.33, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      // Third
      {
        id: "allure-x-top",
        rect: { x: 0, y: 716.67, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-x-bottom",
        rect: { x: 0, y: 871.67, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, y:716.67,  width: 45, height: 199 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", y:716.67,  width: 45, height: 199 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 716.67, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 716.67, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: 871.67, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: 871.67, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      // Forth
      {
        id: "allure-x-top",
        rect: { x: 0, y: 1075, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-x-bottom",
        rect: { x: 0, y: 1230, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, y:1075,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", y:1075,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 1075, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 1075, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: 1230, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: 1230, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
    ],
  },
  {
    id: "squares-left",
    width: 265,
    height: 1275,
    align: "left", // "left" | "right" | "center"
    blockAnchor: "centre",
    verticalAlign: "centre",
    offsetX: 180,
    offsetY: -90,
    elements: [
      // First
      {
        id: "allure-x-top",
        rect: { x: 0, y: 0, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-x-bottom",
        rect: { x: 0, y: 155, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, y:0,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", y:0,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 0, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: 155, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: 155, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      // Second
      {
        id: "allure-x-top",
        rect: { x: 0, y: 358.33, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
        {
        id: "allure-x-bottom",
        rect: { x: 0, y: 513.33, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, y:358.33,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", y:358.33,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 358.33, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 358.33, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: 513.33, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: 513.33, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      // Third
      {
        id: "allure-x-top",
        rect: { x: 0, y: 716.67, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-x-bottom",
        rect: { x: 0, y: 871.67, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, y:716.67,  width: 45, height: 199 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", y:716.67,  width: 45, height: 199 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 716.67, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 716.67, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: 871.67, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: 871.67, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      // Forth
      {
        id: "allure-x-top",
        rect: { x: 0, y: 1075, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-x-bottom",
        rect: { x: 0, y: 1230, width: 265, height: 45 },
        options: {
          imageURL: getImageURL("allure-x-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-left",
        rect: { x: 0, y:1075,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-left"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-y-right",
        rect: { x: "right", y:1075,  width: 45, height: 200 },
        options: {
          imageURL: getImageURL("allure-y-right"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-top",
        rect: { x: 0, y: 1075, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-top",
        rect: { x: "right", y: 1075, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-top"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-left-bottom",
        rect: { x: 0, y: 1230, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-left-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
      {
        id: "allure-corner-right-bottom",
        rect: { x: "right", y: 1230, width: 45, height: 45 },
        options: {
          imageURL: getImageURL("allure-corner-right-bottom"),
          flipHorizontal: false,
          flipVertical: false,
          rotation: 0,
        },
      },
    ],
  },
];

// 3) Glazing definitions
const glazingDefs = [

  // Adina Glass
  {
    id: "adina",
    image: "adina",
  },
  // Clear Glass
  {
    id: "clear",
    image: "clear",
  },
  // Eden Glass
  {
    id: "eden",
    image: "eden",
  },
    // Graphite Glass
    {
      id: "graphite",
      image: "graphite",
    },
  // Harmony Glass
  {
    id: "harmony",
    image: "harmony",
  },
  // Iris Glass
  {
    id: "iris",
    image: "iris",
  },
  // Joy Glass
  {
    id: "joy",
    image: "joy",
  },
  // Murano Glass
  {
    id: "murano",
    image: "murano",
  },
  // Satin Glass
  {
    id: "satin",
    image: "satin",
  },
  // Virtue Glass
  {
    id: "virtue",
    image: "virtue",
  },
    // Digital Glass
    {
      id: "digital",
      image: "digital",
    },
      // Contora Glass
  {
    id: "contora",
    image: "contora",
  },
    // Charcoal Sticks Glass
    {
      id: "charcoal",
      image: "charcoal",
    },
];

const sidescreenStyleDefs = [
  {
    id: "match-door-style",
    name: "Match Door Style",
  },
  {
    id: "full",
    name: "Full",
    glazing: "clear",
  },
  {
    id: "solid",
    name: "Solid",
    glazing: "none",
  },
  {
    id: "midrail",
    name: "Midrail",
    midFrameHeight: 75,
    midFrameOffsetY: 75,
    glazing: "clear",
    midFrameElements: [
      {
        id: "top-transom",
        rect: { x: 0, y: 0, widthFactor: 1, height: 20 },
        options: { imageURL: getImageURL("transom"), flipVertical: false },
      },
      {
        id: "bottom-transom",
        rect: { x: 0, y: "bottom", widthFactor: 1, height: 20 },
        options: { imageURL: getImageURL("transom"), flipVertical: true },
      },
      {
        id: "left-mid-frame",
        rect: { x: 0, y: 0, width: 35, heightFactor: 1 },
        options: { imageURL: getImageURL("frame-y")},
      },
      {
        id: "right-mid-frame",
        rect: { x: "right", y: 0, width: 35, heightFactor: 1 },
        options: { imageURL: getImageURL("frame-y"), flipHorizontal: true  },
      },
      {
        id: "left-top-transom-end",
        rect: { x: 0, y: 0, width: 35, height: 20 },
        options: { imageURL: getImageURL("transom-end") },
      },
      {
        id: "right-top-transom-end",
        rect: { x: "right", y: 0, width: 35, height: 20 },
        options: { imageURL: getImageURL("transom-end"), flipHorizontal: true },
      },
      {
        id: "left-bottom-transom-end",
        rect: { x: 0, y: "bottom", width: 35, height: 20 },
        options: { imageURL: getImageURL("transom-end"), flipVertical: false },
      },
      {
        id: "right-bottm-transom-end",
        rect: { x: "right", y: "bottom", width: 35, height: 20 },
        options: { imageURL: getImageURL("transom-end"), flipHorizontal: true },
      },
    ],
  },
];

const sidescreenGlazingDefs = [
  {
    id: "clear",
    image: "clear",
    margin: 35,
  },
  {
    id: "digital",
    image: "digital",
    margin: 35,
  },
    {
    id: "contora",
    image: "contora",
    margin: 35,
  },
    {
    id: "charcoal",
    image: "charcoal",
    margin: 35,
  },
];

// Letterplates, hardware, etc.
const letterplateDisplayNames = {
  "letterplate-none": "None",
  "letterplate-mid": "Mid",
  "letterplate-low": "Low",
  "letterplate-btm": "Bottom",
};

const hardwareColorOptions = ["gold", "black", "chrome", "graphite"];
const hardwareColorDisplayNames = {
  gold: "Gold",
  black: "Black",
  chrome: "Chrome",
  graphite: "Graphite",
};

const handleOptions = ["lever"];
const handleDisplayNames = { lever: "Lever" };

// Coordinates for letterplates
const letterplateDefs = [
  {
    id: "letterplate-mid-a",
    width: 100,
    height: 25,
    align: "center",
    offsetY: 170,
  },
  {
    id: "letterplate-low-A",
    width: 100,
    height: 25,
    align: "center",
    offsetY: 85,
  },
  {
    id: "letterplate-btm-A",
    width: 100,
    height: 25,
    align: "center",
    offsetY: 50,
  },
];

// Coordinates for handles
const handleDefs = [
  {
    id: "lever",
    width: 36,
    height: 62,
    align: "right", // visual alignment (used for positioning from panel edge)
    offsetX: 21,
    offsetY: 250,
    side: "right", // logical side it belongs on; use this to place hinge on the opposite side
    mirrorWhenLeft: true, // whether to mirror the image when used on the left
  },
];

const hardwareColorMap = {
  gold: "rgba(221, 208, 166, 0.89)",
  black: "rgba(27, 27, 27, 0.90)",
  chrome: "rgba(228, 226, 221, 0.65)",
  graphite: "rgba(108, 108, 106, 0.65)",
};

const glazingDisplayNames = {
  clear: "Clear",
  adina: "Adina",
  eden: "Eden",
  graphite: "Graphite",
  harmony: "Harmony",
  iris: "Iris",
  joy: "Joy",
  murano: "Murano Black",
  satin: "Satin",
  virtue: "Virtue",
  digital: "Digital",
  contora: "Contora",
  charcoal: "Charcoal Sticks",
};

// Steps & wizard state
const stepIDs = [
  "configuration-step",
  "sidescreen-style-step",
  "style-step",
  "finish-step",
  "glazing-step",
  "hardware-step",
];

export const state = {
  currentStep: 0,
  stepsCompleted: Array(7).fill(true),
  doorType: "single", // Door type: "single" for traditional entry doors, "patio" for sliding patio doors
  selectedRange: doorRanges[0],
  selectedStyle: "berlin",
  selectedConfiguration: "single",
  selectedGlazing: "clear",
  selectedLetterplate: null,
  selectedHardwareColor: "gold",
  selectedHandle: "lever",
  handleSide: "right",
  selectedExternalFinish: "Golden Oak",
  selectedInternalFinish: "Brilliant White",
  selectedExternalFrameFinish: "Golden Oak",
  selectedInternalFrameFinish: "Brilliant White",
  selectedLeftPanel: null,
  selectedRightPanel: null,
  selectedSidescreenStyle: "full",
  backbtmImg: null,
  currentView: "external",
  glazingObscureEnabled: false,
  hasFanlight: false,
};

export {
  configurations,
  patioDoorConfigurations,
  doorCollections,
  doorRanges,
  doorStyles,
  imageOverloads,
  styleDisplayNames,
  glazingDefs,  
  handleDefs,
  hardwareColorMap,
  moldingDefs,
  letterplateDefs,
  textureDefs,
  hardwareColorDisplayNames,
  handleDisplayNames,
  letterplateDisplayNames,
  glazingDisplayNames,
  finishOptions,
  internalFinishMap,
  hardwareColorOptions,
  stepIDs,
  handleOptions,
  sidescreenGlazingDefs,
  sidescreenStyleDefs,
  patioDoorSizeLimits,
};
