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
          brandOwner: typedRow.brand_owner || null,
          brandName: typedRow.brand_name || null,
          subbrandName: typedRow.subbrand_name || null,
          gtinUpc: typedRow.gtin_upc || null,
          subIngredients: typedRow.ingredients || null,
          notASignificantSourceOf: typedRow.not_a_significant_source_of || null,
          servingSize: Number(typedRow.serving_size) || null,
          servingSizeUnit: typedRow.serving_size_unit || null,
          servingSizeDescription: typedRow.household_serving_fulltext || null,
          category: typedRow.branded_food_category || null,
          fdcDataSource: typedRow.data_source || null,
          fdcModifiedDate: typedRow.modified_date
            ? new Date(typedRow.modified_date)
            : null,
          fdcAvailableDate: typedRow.available_date
            ? new Date(typedRow.available_date)
            : null,
        },
      })
    )
  }
  await queue.onIdle()
}

export default loadBrandData
