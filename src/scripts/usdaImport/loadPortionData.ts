import { PrismaClient } from "@prisma/client";
import { FoodPortionRow } from "./types";
import { openFile } from "./utils";

const FOOD_PORTION_PATH = `./data/tidy_food_portion.csv`;

export const loadPortionData = async (prisma: PrismaClient) => {
  const portionFile = openFile(FOOD_PORTION_PATH);
  let portionBuffer: FoodPortionRow[] = [];
  let counter = 0;
  let bufferCounter = 0;

  const getMeasure = (row: FoodPortionRow) => {
    if (!row.measure_unit?.trim() && !row.portion_description?.trim() && row.modifier?.trim()) {
      return "serving";
    }
    return `${row.amount} ${row.measure_unit} ${row.portion_description} ${row.modifier}`.toString().trim().toString();
  };

  const writePortions = async () => {
    await prisma.portion.createMany({
      data: portionBuffer.map((row) => ({
        food_id: row.fdc_id,
        sequence_number: row.seq_num ? row.seq_num : 1,
        measure: getMeasure(row),
        gram_weight: row.gram_weight,
      })),
    });
    portionBuffer = [];
  };

  for await (const row of portionFile) {
    const typedRow: FoodPortionRow = row as FoodPortionRow;
    counter += 1;
    bufferCounter += 1;

    portionBuffer.push(typedRow);
    if (bufferCounter > 50000) {
      await writePortions();
      bufferCounter = 0;
    }
    console.log(`Created Portion ${counter}`);
  }

  await writePortions();
};
