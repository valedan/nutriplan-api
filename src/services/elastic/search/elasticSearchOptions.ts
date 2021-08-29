export default {
  page: { size: 50 },
  result_fields: { id: { raw: {} }, description: { raw: {} } },
  precision: 4,
  search_fields: {
    description: {},
    brand: {},
    additional_descriptions: {},
  },
  filters: {
    data_source: ["usda_sr_legacy_food", "usda_foundation_food", "usda_survey_fndds_food", "usda_branded_food"],
  },
  boosts: {
    data_source: [
      {
        type: "value",
        value: "usda_sr_legacy_food",
        operation: "multiply",
        factor: 5,
      },
      {
        type: "value",
        value: "usda_foundation_food",
        operation: "multiply",
        factor: 5,
      },
      {
        type: "value",
        value: "usda_survey_fndds_food",
        operation: "multiply",
        factor: 2.5,
      },
      {
        type: "value",
        value: "usda_branded_food",
        operation: "multiply",
        factor: 1,
      },
    ],
    category: [
      {
        type: "value",
        value: "Liquor and cocktails",
        operation: "multiply",
        factor: 0.5,
      },
      {
        type: "value",
        value: ["Baby food: vegetable", "Baby food: meat and dinners", "Baby juice"],
        operation: "multiply",
        factor: 0.5,
      },
      {
        type: "value",
        value: ["Fast Foods", "Restaurant Foods"],
        operation: "multiply",
        factor: 0.5,
      },
      {
        type: "value",
        value: ["Sausages and Luncheon Meats"],
        operation: "multiply",
        factor: 0.8,
      },
      {
        type: "value",
        value: ["Baked Products", "Sweets", "Snacks", "Biscuits, muffins, quick breads", "Chips, Pretzels & Snacks"],
        operation: "multiply",
        factor: 0.5,
      },
      {
        type: "value",
        value: [
          "Bean, pea, legume dishes",
          "Meat mixed dishes",
          "Other Mexican mixed dishes",
          "Pasta mixed dishes, excludes macaroni and cheese",
          "Poultry mixed dishes",
          "Seafood mixed dishes",
          "Rice mixed dishes",
          "Vegetable dishes",
          "Soups, Sauces, and Gravies",
          "Dips, gravies, other sauces",
          "Soups",
        ],
        operation: "multiply",
        factor: 0.5,
      },
    ],
  },
};
