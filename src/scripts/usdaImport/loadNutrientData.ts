import { PrismaClient } from "@prisma/client";
import { NutrientRow } from "./types";
import { openFile } from "./utils";

const NUTRIENT_PATH = `./data/nutrient.csv`;

export const loadNutrientData = async (prisma: PrismaClient) => {
  const nutrientFile = openFile(NUTRIENT_PATH);
  const nutrientBuffer: NutrientRow[] = [];

  for await (const row of nutrientFile) {
    const typedRow: NutrientRow = row as NutrientRow;
    nutrientBuffer.push(typedRow);
  }

  await prisma.nutrient.createMany({
    data: nutrientBuffer.map((row) => ({
      id: row.id,
      name: row.name,
      unit: row.unit_name,
    })),
  });
};
