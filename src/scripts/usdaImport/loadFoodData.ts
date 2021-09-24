import { PrismaClient, Food } from "@prisma/client"
import { openFile, loadWWEIAMappings } from "./utils"
import { FoodRow } from "./types"
import PrismaBuffer from "./PrismaBuffer"

const PATH = `./data/food.csv`
const ROW_LIMIT = undefined
const ROW_SKIP = undefined

const loadFoodData = async (prisma: PrismaClient): Promise<void> => {
  let counter = 0
  const wweiaCategories = await loadWWEIAMappings()
  const foodFile = openFile(PATH, ROW_SKIP, ROW_LIMIT)
  const foodBuffer = new PrismaBuffer(prisma, "food", 1000)

  for await (const row of foodFile) {
    const typedRow: FoodRow = row as FoodRow
    counter += 1
    await foodBuffer.create({
      id: Number(typedRow.fdc_id),
      description: typedRow.description,
      dataSource: `usda_${typedRow.data_type}`,
      category: wweiaCategories[typedRow.food_category_id],
    } as Food)

    console.log(`Created Food ${counter}`)
  }

  await foodBuffer.flush()
}

export default loadFoodData
