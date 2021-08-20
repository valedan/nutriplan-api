import { PrismaClient } from "@prisma/client";
import { FoodNutrientRow } from "./types";
import { openFile } from "./utils";

const FOOD_NUTRIENT_PATH = `./data/food_nutrient.csv`;

export const loadFoodNutrientData = async (prisma: PrismaClient) => {
  const nutrientFile = openFile(FOOD_NUTRIENT_PATH);
  let foodNutrientBuffer: FoodNutrientRow[] = [];
  let counter = 0;
  let bufferCounter = 0;

  const writeFoodNutrients = async () => {
    await prisma.foodNutrient.createMany({
      data: foodNutrientBuffer.map((row) => ({
        food_id: row.fdc_id,
        nutrient_id: row.nutrient_id,
        amount: row.amount,
      })),
    });
    foodNutrientBuffer = [];
  };

  for await (const row of nutrientFile) {
    const typedRow: FoodNutrientRow = row as FoodNutrientRow;
    counter += 1;
    bufferCounter += 1;

    foodNutrientBuffer.push(typedRow);
    if (bufferCounter > 250000) {
      await writeFoodNutrients();
      bufferCounter = 0;
    }
    console.log(`Created FoodNutrient ${counter}`);
  }

  await writeFoodNutrients();
};
