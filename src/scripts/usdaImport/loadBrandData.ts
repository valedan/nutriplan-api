import { PrismaClient } from "@prisma/client"
import PQueue from "p-queue"
import { openFile } from "./utils"
import { BrandedFoodRow } from "./types"

const PATH = `./data/branded_food.csv`
const ROW_LIMIT = undefined
const ROW_SKIP = undefined

const queue = new PQueue({ concurrency: 1000 })

let counter = 0
queue.on("next", () => {
  counter += 1
  console.log(
    `Brand data loaded. Completed: ${counter} Remaining: ${
      queue.size + queue.pending
    }`
  )
})

const loadBrandData = async (prisma: PrismaClient): Promise<void> => {
  const brandFile = openFile(PATH, ROW_SKIP, ROW_LIMIT)
  for await (const row of brandFile) {
    const typedRow: BrandedFoodRow = row as BrandedFoodRow
    const foodId = Number(typedRow.fdc_id)

    void queue.add(() =>
      prisma.food.update({
        where: { id: foodId },
        data: {
          brand_owner: typedRow.brand_owner || null,
          brand_name: typedRow.brand_name || null,
          subbrand_name: typedRow.subbrand_name || null,
          gtin_upc: typedRow.gtin_upc || null,
          ingredients: typedRow.ingredients || null,
          not_a_significant_source_of:
            typedRow.not_a_significant_source_of || null,
          serving_size: Number(typedRow.serving_size) || null,
          serving_size_unit: typedRow.serving_size_unit || null,
          serving_size_description: typedRow.household_serving_fulltext || null,
          category: typedRow.branded_food_category || null,
          fdc_data_source: typedRow.data_source || null,
          fdc_modified_date: typedRow.modified_date
            ? new Date(typedRow.modified_date)
            : null,
          fdc_available_date: typedRow.available_date
            ? new Date(typedRow.available_date)
            : null,
        },
      })
    )
  }
  await queue.onIdle()
}

export default loadBrandData
