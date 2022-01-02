import { PrismaClient } from "@prisma/client"
import { NutrientUnit } from ".prisma/client"
import nutrientData from "./nutrients.json"

interface NutrientSeedData {
  id: number
  name: string
  unit: NutrientUnit
  nutrientNumber: number
}

export const seedNutrients = async (): Promise<void> => {
  const prisma = new PrismaClient()
  try {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("Seeding is only allowed in test environment")
    }
    await prisma.nutrient.deleteMany({})
    await prisma.nutrient.createMany({
      data: nutrientData as NutrientSeedData[],
    })
  } finally {
    void (await prisma.$disconnect())
  }
}
