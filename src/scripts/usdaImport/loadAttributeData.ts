import { PrismaClient, Food } from "@prisma/client"
import PQueue from "p-queue"
import { openFile, loadWWEIAMappings } from "./utils"
import { FoodAttributeRow } from "./types"

const PATH = `./data/food_attribute.csv`
const ROW_LIMIT = undefined
const ROW_SKIP = undefined

const queue = new PQueue({ concurrency: 1000 })

let counter = 0
queue.on("next", () => {
  counter += 1
  console.log(
    `Attribute data loaded. Completed: ${counter} Remaining: ${
      queue.size + queue.pending
    }`
  )
})

const loadAttributeData = async (prisma: PrismaClient): Promise<void> => {
  const wweiaCategories = await loadWWEIAMappings()
  const file = openFile(PATH, ROW_SKIP, ROW_LIMIT)

  for await (const row of file) {
    const typedRow: FoodAttributeRow = row as FoodAttributeRow
    const foodId = Number(typedRow.fdc_id)
    const updateData: Partial<Food> = {}

    if (typedRow.food_attribute_type_id === "1000") {
      updateData.commonNames = typedRow.value.toString()
    }

    if (typedRow.food_attribute_type_id === "1001") {
      if (updateData.additionalDescriptions) {
        updateData.additionalDescriptions.push(typedRow.value.toString())
      } else {
        updateData.additionalDescriptions = [typedRow.value.toString()]
      }
    }

    if (typedRow.food_attribute_type_id === "999") {
      if (typedRow.name === "WWEIA Category number") {
        updateData.category = wweiaCategories[typedRow.value]
      } else if (typedRow.name === "WWEIA Category description") {
        updateData.category = typedRow.value.toString()
      }
    }

    if (Object.keys(updateData).length > 0) {
      void queue.add(() =>
        prisma.food.update({
          where: { id: foodId },
          data: updateData,
        })
      )
    }
  }
  await queue.onIdle()
}

export default loadAttributeData
