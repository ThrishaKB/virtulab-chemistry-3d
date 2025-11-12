export interface Chemical {
  id: string;
  name: string;
  formula: string;
  color: string;
  state: "liquid" | "solid" | "gas";
}

export interface Equipment {
  id: string;
  name: string;
  type: "beaker" | "flask" | "test-tube" | "burner";
  capacity?: number;
}

export interface ExperimentMaterials {
  experimentId: string;
  title: string;
  chemicals: Chemical[];
  equipment: Equipment[];
  steps: string[];
  reactions: ReactionRule[];
}

export interface ReactionRule {
  reactants: string[]; // Chemical IDs
  product: {
    name: string;
    color: string;
    effect: "color-change" | "precipitate" | "gas" | "flame" | "heat";
  };
}

export const experimentMaterials: Record<string, ExperimentMaterials> = {
  neutralization: {
    experimentId: "neutralization",
    title: "Neutralization Reaction",
    chemicals: [
      { id: "hcl", name: "Hydrochloric Acid", formula: "HCl", color: "#ff6b6b", state: "liquid" },
      { id: "naoh", name: "Sodium Hydroxide", formula: "NaOH", color: "#4ecdc4", state: "liquid" },
      { id: "phenolphthalein", name: "Phenolphthalein Indicator", formula: "C₂₀H₁₄O₄", color: "#ff00ff", state: "liquid" },
    ],
    equipment: [
      { id: "beaker-250", name: "Beaker 250ml", type: "beaker", capacity: 250 },
      { id: "beaker-100", name: "Beaker 100ml", type: "beaker", capacity: 100 },
    ],
    steps: [
      "Pour HCl into the 250ml beaker",
      "Add phenolphthalein indicator",
      "Slowly add NaOH while observing color change",
      "Stop when solution turns pink (neutral pH)"
    ],
    reactions: [
      {
        reactants: ["hcl", "naoh"],
        product: {
          name: "Sodium Chloride + Water",
          color: "#90EE90",
          effect: "color-change"
        }
      }
    ]
  },
  precipitation: {
    experimentId: "precipitation",
    title: "Precipitation Reaction",
    chemicals: [
      { id: "silver-nitrate", name: "Silver Nitrate", formula: "AgNO₃", color: "#c0c0c0", state: "liquid" },
      { id: "sodium-chloride", name: "Sodium Chloride", formula: "NaCl", color: "#ffffff", state: "liquid" },
    ],
    equipment: [
      { id: "beaker-250", name: "Beaker 250ml", type: "beaker", capacity: 250 },
      { id: "test-tube-1", name: "Test Tube", type: "test-tube" },
    ],
    steps: [
      "Pour silver nitrate into beaker",
      "Add sodium chloride solution",
      "Observe white precipitate formation"
    ],
    reactions: [
      {
        reactants: ["silver-nitrate", "sodium-chloride"],
        product: {
          name: "Silver Chloride (precipitate)",
          color: "#f8f8f8",
          effect: "precipitate"
        }
      }
    ]
  },
  displacement: {
    experimentId: "displacement",
    title: "Displacement Reaction",
    chemicals: [
      { id: "copper-sulfate", name: "Copper Sulfate", formula: "CuSO₄", color: "#0099ff", state: "liquid" },
      { id: "zinc", name: "Zinc Metal", formula: "Zn", color: "#b8b8b8", state: "solid" },
    ],
    equipment: [
      { id: "beaker-250", name: "Beaker 250ml", type: "beaker", capacity: 250 },
    ],
    steps: [
      "Pour copper sulfate solution into beaker",
      "Add zinc metal strip",
      "Observe color change and copper deposition"
    ],
    reactions: [
      {
        reactants: ["copper-sulfate", "zinc"],
        product: {
          name: "Zinc Sulfate + Copper",
          color: "#d4d4d4",
          effect: "color-change"
        }
      }
    ]
  },
  combustion: {
    experimentId: "combustion",
    title: "Combustion Reaction",
    chemicals: [
      { id: "ethanol", name: "Ethanol", formula: "C₂H₅OH", color: "#ffeb3b", state: "liquid" },
      { id: "oxygen", name: "Oxygen", formula: "O₂", color: "#e3f2fd", state: "gas" },
    ],
    equipment: [
      { id: "burner", name: "Bunsen Burner", type: "burner" },
      { id: "beaker-100", name: "Beaker 100ml", type: "beaker", capacity: 100 },
    ],
    steps: [
      "Pour small amount of ethanol into beaker",
      "Light the Bunsen burner",
      "Observe the flame and combustion products"
    ],
    reactions: [
      {
        reactants: ["ethanol", "oxygen"],
        product: {
          name: "Carbon Dioxide + Water",
          color: "#ff6b00",
          effect: "flame"
        }
      }
    ]
  },
  decomposition: {
    experimentId: "decomposition",
    title: "Decomposition Reaction",
    chemicals: [
      { id: "hydrogen-peroxide", name: "Hydrogen Peroxide", formula: "H₂O₂", color: "#e3f2fd", state: "liquid" },
      { id: "manganese-dioxide", name: "Manganese Dioxide", formula: "MnO₂", color: "#424242", state: "solid" },
    ],
    equipment: [
      { id: "flask", name: "Erlenmeyer Flask", type: "flask" },
      { id: "test-tube-1", name: "Test Tube", type: "test-tube" },
    ],
    steps: [
      "Pour hydrogen peroxide into flask",
      "Add manganese dioxide catalyst",
      "Observe rapid gas evolution"
    ],
    reactions: [
      {
        reactants: ["hydrogen-peroxide", "manganese-dioxide"],
        product: {
          name: "Water + Oxygen Gas",
          color: "#ffffff",
          effect: "gas"
        }
      }
    ]
  },
  "acid-base": {
    experimentId: "acid-base",
    title: "Acid-Base Indicator Reaction",
    chemicals: [
      { id: "universal-indicator", name: "Universal Indicator", formula: "Mixed", color: "#9c27b0", state: "liquid" },
      { id: "acid", name: "Acid Solution", formula: "H⁺", color: "#ff1744", state: "liquid" },
      { id: "base", name: "Base Solution", formula: "OH⁻", color: "#00e676", state: "liquid" },
    ],
    equipment: [
      { id: "test-tube-1", name: "Test Tube 1", type: "test-tube" },
      { id: "test-tube-2", name: "Test Tube 2", type: "test-tube" },
      { id: "test-tube-3", name: "Test Tube 3", type: "test-tube" },
    ],
    steps: [
      "Add universal indicator to each test tube",
      "Add acid to first test tube (observe red color)",
      "Add base to second test tube (observe blue color)",
      "Mix both in third test tube (observe green/yellow)"
    ],
    reactions: [
      {
        reactants: ["universal-indicator", "acid"],
        product: {
          name: "Acidic Solution",
          color: "#ff1744",
          effect: "color-change"
        }
      },
      {
        reactants: ["universal-indicator", "base"],
        product: {
          name: "Basic Solution",
          color: "#00e676",
          effect: "color-change"
        }
      }
    ]
  }
};
