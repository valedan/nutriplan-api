import { PrismaClient, Nutrient } from "@prisma/client"
import { openFile } from "./utils"
import { NutrientRow } from "./types"
import PrismaBuffer from "./PrismaBuffer"

const PATH = `./data/nutrient.csv`
const ROW_LIMIT = undefined
const ROW_SKIP = undefined

const loadNutrientData = async (prisma: PrismaClient): Promise<void> => {
  let counter = 0
  const file = openFile(PATH, ROW_SKIP, ROW_LIMIT)
  const buffer = new PrismaBuffer(prisma, "nutrient", 1000)

  for await (const row of file) {
    counter += 1
    const typedRow: NutrientRow = row as NutrientRow

    await buffer.create({
      id: Number(typedRow.id),
      name: typedRow.name,
      unit: typedRow.unit_name,
      nutrientNumber: Math.floor(Number(typedRow.nutrient_nbr)),
    } as Nutrient)

    console.log(`Created Nutrient ${counter}`)
  }

  await buffer.flush()
}

export default loadNutrientData
