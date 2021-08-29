import { PrismaClient } from "@prisma/client"
import loadFoodData from "./usdaImport/loadFoodData"
import loadBrandData from "./usdaImport/loadBrandData"
import loadAttributeData from "./usdaImport/loadAttributeData"
import loadNutrientData from "./usdaImport/loadNutrientData"
import loadFoodNutrientData from "./usdaImport/loadFoodNutrientData"
import loadPortionData from "./usdaImport/loadPortionData"
import loadSRCategories from "./usdaImport/loadSRCategories"
import flagHistoricalRecords from "./usdaImport/flagHistoricalRecords"
import populateNutrientCounts from "./usdaImport/populateNutrientCounts"
import removeDescriptionPhrases from "./usdaImport/removeDescriptionPhrases"

const prisma = new PrismaClient()

const importData = async () => {
  const start = Date.now()
  await loadFoodData(prisma)
  await loadBrandData(prisma)
  await loadAttributeData(prisma)
  await loadNutrientData(prisma)
  await loadFoodNutrientData(prisma)
  await loadPortionData(prisma)
  await loadSRCategories(prisma)
  await flagHistoricalRecords(prisma)
  await populateNutrientCounts(prisma)
  await removeDescriptionPhrases(prisma)
  console.log(`time taken = ${(Date.now() - start) / 1000}s`)
}

importData()
  .catch((e) => {
    throw e
  })
  .finally(() => {
    void prisma.$disconnect()
  })
