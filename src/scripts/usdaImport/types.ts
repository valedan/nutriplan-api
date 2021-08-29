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
  id: string
  name: string
}

export type SRFoodRow = {
  ndb_id: string
  group_id: string
}

export type SRLegacyFoodRow = {
  fdc_id: string
  NDB_number: string
}

export type BrandedFoodRow = {
  fdc_id: string
  brand_owner: string
  brand_name: string
  subbrand_name: string
  gtin_upc: string
  ingredients: string
  not_a_significant_source_of: string
  serving_size: string
  serving_size_unit: "g" | "ml"
  household_serving_fulltext: string
  branded_food_category: string
  data_source: string
  modified_date: string
  available_date: string
  market_country: string
  discontinued_date: string
}

export type FNDDSIngredientNutrientValueRow = {
  "ingredient code": string
  "Ingredient description": string
  "Nutrient code": string
  "Nutrient value": string
  "Nutrient value source": string
  "FDC ID": string
  "Derivation code": string
  "SR AddMod year": string
  "Foundation year acquired": string
  "Start date": string
  "End date": string
}

export type FoodAttributeRow = {
  id: string
  fdc_id: string
  seq_num: string
  food_attribute_type_id: string
  name: string
  value: string
}

export type FoodCalorieConversionFactorRow = {
  food_nutrient_conversion_factor_id: string
  protein_value: string
  fat_value: string
  carbohydrate_value: string
}

export type FoodNutrientConversionFactorRow = {
  id: string
  fdc_id: string
}

export type FoodNutrientRow = {
  id: string
  fdc_id: string
  nutrient_id: string
  amount: string
  data_points: string
  derivation_id: string
  min: string
  max: string
  median: string
  footnote: string
  min_year_acquired: string
}

export type FoodPortionRow = {
  id: string
  fdc_id: string
  seq_num: string
  amount: string
  measure_unit_id: string
  portion_description: string
  modifier: string
  gram_weight: string
  data_points: string
  footnote: string
  min_year_acquired: string
}

export type FoodRow = {
  fdc_id: string
  data_type: string
  description: string
  food_category_id: string
  publication_date: string
}

export type MeasureUnitRow = {
  id: string
  name: string
}

export type NutrientRow = {
  id: string
  name: string
  unit_name: NutrientUnit
  nutrient_nbr: string
  rank: string
}

export type WWEIARow = {
  wweia_food_category: string
  wweia_food_category_description: string
}

export type FoodBufferEntry = FoodRow &
  Partial<BrandedFoodRow> & {
    commonNames?: string
    wweiaCategory?: string
    additionalDescriptions?: string[]
  }

export type ConversionFactor = {
  fdc_id: string
  protein_value: string
  fat_value: string
  carbohydrate_value: string
}
