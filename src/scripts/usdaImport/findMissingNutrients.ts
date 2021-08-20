import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { FoodNutrientRow, FNDDSIngredientNutrientValueRow } from "./types";
import { openFile } from "./utils";

const FOOD_NUTRIENT_PATH = `./data/food_nutrient.csv`;
const FNDDS_INGREDIENT_NUTRIENT_VALUE_PATH = `./data/fndds_ingredient_nutrient_value.csv`;

const findMissingNutrients = async (prisma: PrismaClient) => {
  const rawMissing = fs.readFileSync("./data/foodsWithoutNutrients.json");
  const foodsWithoutNutrients: number[] = (JSON.parse(rawMissing.toString()) as { ids: number[] }).ids.sort();
  console.log(foodsWithoutNutrients);
  const foodsWithDataInNutrientFile: number[] = [];
  const foodsWithDataInFNDDSFile: number[] = [];
  const nutrientFile = openFile(FOOD_NUTRIENT_PATH);
  const fnddsFile = openFile(FNDDS_INGREDIENT_NUTRIENT_VALUE_PATH);
  let counter = 0;

  for await (const row of nutrientFile) {
    const typedRow: FoodNutrientRow = row as FoodNutrientRow;
    counter += 1;
    if (foodsWithoutNutrients.find((id) => id === typedRow.fdc_id)) {
      // if (bs(foodsWithoutNutrients, typedRow.fdc_id, (el, ned) => el - ned)) {
      foodsWithDataInNutrientFile.push(typedRow.fdc_id);
      console.log(`Found nutrients for ${typedRow.fdc_id}`);
    }
    console.log(`FoodNutrient ${counter}`);
  }

  for await (const row of fnddsFile) {
    const typedRow: FNDDSIngredientNutrientValueRow = row as FNDDSIngredientNutrientValueRow;
    counter += 1;
    if (foodsWithoutNutrients.find((id) => id === typedRow["FDC ID"])) {
      // if (bs(foodsWithoutNutrients, typedRow["FDC ID"], (el, ned) => el - ned)) {
      foodsWithDataInFNDDSFile.push(typedRow["FDC ID"]);
      console.log(`Found nutrients for ${typedRow["FDC ID"]}`);
    }
    console.log(`FNDDS ${counter}`);
  }

  console.log(`Nutrients file - ${foodsWithDataInNutrientFile.toString()}`);
  console.log(`FNDDS file - ${foodsWithDataInFNDDSFile.toString()}`);
  console.log(`Nutrients file length - ${foodsWithDataInNutrientFile.length}`);
  console.log(`FNDDS file length - ${foodsWithDataInFNDDSFile.length}`);
};
