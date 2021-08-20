/* eslint-disable no-console */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { loadFoodData } from "./usdaImport/loadFoodData";
import { loadNutrientData } from "./usdaImport/loadNutrientData";
import { loadFoodNutrientData } from "./usdaImport/loadFoodNutrientData";
import { loadPortionData } from "./usdaImport/loadPortionData";

const prisma = new PrismaClient();

const deleteData = async () => {
  await prisma.foodNutrient.deleteMany();
  await prisma.nutrient.deleteMany();
  await prisma.portion.deleteMany();
  await prisma.food.deleteMany();
};

const importData = async () => {
  const start = Date.now();
  // await deleteData();
  await loadFoodData(prisma);
  // await loadNutrientData(prisma);
  // await loadFoodNutrientData(prisma);
  // await loadPortionData(prisma);
  console.log(`time taken = ${(Date.now() - start) / 1000}s`);
  // await findMissingNutrients();
};

importData()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
