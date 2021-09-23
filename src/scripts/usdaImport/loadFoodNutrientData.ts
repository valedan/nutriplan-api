import { PrismaClient, FoodNutrient } from "@prisma/client"
import { openFile } from "./utils"
import { FoodNutrientRow } from "./types"
import PrismaBuffer from "./PrismaBuffer"

const PATH = `./data/food_nutrient.csv`
const ROW_LIMIT = undefined
const ROW_SKIP = undefined

const loadFoodNutrientData = async (prisma: PrismaClient): Promise<void> => {
  let counter = 0
  const file = openFile(PATH, ROW_SKIP, ROW_LIMIT)
  const buffer = new PrismaBuffer(prisma, "food_nutrient", 1000)
  const nutrients = await prisma.nutrient.findMany()

  for await (const row of file) {
    counter += 1
    const typedRow: FoodNutrientRow = row as FoodNutrientRow

    const nutrient = nutrients.find(
      (n) =>
        n.id === Number(typedRow.nutrient_id) ||
        n.nutrient_number === Number(typedRow.nutrient_id)
    )
    if (nutrient) {
      try {
        await buffer.create({
          id: Number(typedRow.id),
          food_id: Number(typedRow.fdc_id),
          nutrient_id: nutrient.id,
          amount: Number(typedRow.amount),
        } as FoodNutrient)
      } catch (e) {
        console.log(e)
        console.log(
          (buffer.buffer as FoodNutrient[]).map((fn: FoodNutrient) => fn.foodId)
        )
      }
    } else {
      console.log(`NUTRIENT MISSING`)
      console.log(typedRow)
    }

    console.log(`Created FoodNutrient ${counter}`)
  }

  await buffer.flush()
}

export default loadFoodNutrientData
