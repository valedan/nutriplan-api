import parse from "csv-parse";
import fs from "fs";
import {
  WWEIARow,
  FoodCalorieConversionFactorRow,
  FoodNutrientConversionFactorRow,
  ConversionFactor,
  MeasureUnitRow,
} from "./types";

const WWEIA_FOOD_CATEGORY_PATH = `./data/wweia_food_category.csv`;
const FOOD_CALORIE_CONVERSION_FACTOR_PATH = `./data/food_calorie_conversion_factor.csv`;
const FOOD_NUTRIENT_CONVERSION_FACTOR_PATH = `./data/food_nutrient_conversion_factor.csv`;
const MEASURE_UNIT_PATH = `./data/measure_unit.csv`;

export const openFile = (path: string, toLine?: number) => {
  const opts: parse.Options = { columns: true, cast: true };

  if (toLine) {
    opts.toLine = toLine;
  }

  return fs.createReadStream(path).pipe(parse(opts));
};

export const loadWWEIAMappings = async () => {
  const wweiaCategories: { [key: string]: string } = {};
  const wweiaFile = openFile(WWEIA_FOOD_CATEGORY_PATH);
  for await (const row of wweiaFile) {
    const typedRow: WWEIARow = row as WWEIARow;
    wweiaCategories[typedRow.wweia_food_category] = typedRow.wweia_food_category_description;
  }
  return wweiaCategories;
};

export const loadConversionFactors = async () => {
  const conversionFactors: { [key: string]: ConversionFactor } = {};

  const conversionFactorFile = openFile(FOOD_CALORIE_CONVERSION_FACTOR_PATH);
  const idFile = openFile(FOOD_NUTRIENT_CONVERSION_FACTOR_PATH);
  const conversionFactorsTemp: { [key: string]: FoodCalorieConversionFactorRow } = {};

  for await (const row of conversionFactorFile) {
    const typedRow: FoodCalorieConversionFactorRow = row as FoodCalorieConversionFactorRow;
    conversionFactorsTemp[typedRow.food_nutrient_conversion_factor_id] = typedRow;
  }

  for await (const row of idFile) {
    const typedRow: FoodNutrientConversionFactorRow = row as FoodNutrientConversionFactorRow;
    if (conversionFactorsTemp[typedRow.id]) {
      conversionFactors[typedRow.fdc_id] = {
        fdc_id: typedRow.fdc_id,
        protein_value: conversionFactorsTemp[typedRow.id].protein_value,
        fat_value: conversionFactorsTemp[typedRow.id].fat_value,
        carbohydrate_value: conversionFactorsTemp[typedRow.id].carbohydrate_value,
      };
    }
  }
  return conversionFactors;
};

export const loadMeasureUnits = async () => {
  const measureUnits: { [key: string]: string } = {};

  const measuresFile = openFile(MEASURE_UNIT_PATH);
  for await (const row of measuresFile) {
    const typedRow: MeasureUnitRow = row as MeasureUnitRow;
    measureUnits[typedRow.id] = typedRow.name;
  }

  return measureUnits;
};
