export enum NutrientUnit {
  G = "G",
  KCAL = "KCAL",
  MG = "MG",
  kJ = "kJ",
  SP_GR = "SP_GR",
  UG = "UG",
  IU = "IU",
  MG_ATE = "MG_ATE",
}
export type SRGroupRow = {
  id: string;
  name: string;
};

export type SRFoodRow = {
  ndb_id: string;
  group_id: string;
};

export type SRLegacyFoodRow = {
  fdc_id: string;
  NDB_number: string;
};

export type BrandedFoodRow = {
  fdc_id: number;
  brand_owner: string;
  gtin_upc: string;
  ingredients: string;
  serving_size: number;
  serving_size_unit: "g" | "ml";
  household_serving_fulltext: string;
  branded_food_category: string;
  data_source: string;
  modified_date: string;
  available_date: string;
  market_country: string;
  discontinued_date: string;
};

export type FNDDSIngredientNutrientValueRow = {
  "ingredient code": number;
  "Ingredient description": string;
  "Nutrient code": number;
  "Nutrient value": number;
  "Nutrient value source": string;
  "FDC ID": number;
  "Derivation code": string;
  "SR AddMod year": number;
  "Foundation year acquired": number;
  "Start date": string;
  "End date": string;
};

export type FoodAttributeRow = {
  id: number;
  fdc_id: number;
  seq_num: number | "";
  food_attribute_type_id: number;
  name: string;
  value: number | string;
};

export type FoodCalorieConversionFactorRow = {
  food_nutrient_conversion_factor_id: number;
  protein_value: number;
  fat_value: number;
  carbohydrate_value: number;
};

// type FoodCategoryRow = {
//   id: number;
//   code: number;
//   description: string;
// };

export type FoodNutrientConversionFactorRow = {
  id: number;
  fdc_id: number;
};

export type FoodNutrientRow = {
  id: number;
  fdc_id: number;
  nutrient_id: number;
  amount: number;
  data_points: number;
  derivation_id: number;
  min: number;
  max: number;
  median: number | "";
  footnote: string;
  min_year_acquired: number | "";
};

export type FoodPortionRow = {
  id: number;
  fdc_id: number;
  seq_num: number | "";
  amount: number;
  measure_unit: string;
  portion_description: string;
  modifier: string;
  gram_weight: number;
  data_points: number;
  footnote: number;
  min_year_acquired: number | "";
};

export type FoodRow = {
  fdc_id: number;
  data_type: string;
  description: string;
  food_category_id: number | "";
  publication_date: string;
};

export type MeasureUnitRow = {
  id: number;
  name: string;
};

export type NutrientRow = {
  id: number;
  name: string;
  unit_name: NutrientUnit;
  nutrient_nbr: number;
  rank: number;
};

export type WWEIARow = {
  wweia_food_category: number;
  wweia_food_category_description: string;
};

export type FoodBufferEntry = FoodRow &
  Partial<BrandedFoodRow> & {
    commonNames?: string;
    wweiaCategory?: string;
    additionalDescriptions?: string[];
  };

export type ConversionFactor = {
  fdc_id: number;
  protein_value: number;
  fat_value: number;
  carbohydrate_value: number;
};
