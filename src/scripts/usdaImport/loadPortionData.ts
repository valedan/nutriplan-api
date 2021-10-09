import { Portion, PrismaClient } from "@prisma/client"
import { loadMeasureUnits, openFile } from "./utils"
import { FoodPortionRow } from "./types"
import PrismaBuffer from "./PrismaBuffer"

const PATH = `./data/food_portion.csv`
const ROW_LIMIT = undefined
const ROW_SKIP = undefined

const loadPortionData = async (prisma: PrismaClient): Promise<void> => {
  let counter = 0
  const measureUnits = await loadMeasureUnits()
  const file = openFile(PATH, ROW_SKIP, ROW_LIMIT)
  const buffer = new PrismaBuffer(prisma, "portion", 1000)

  for await (const row of file) {
    counter += 1
    const typedRow: FoodPortionRow = row as FoodPortionRow

    await buffer.create({
      id: Number(typedRow.id),
      foodId: Number(typedRow.fdc_id),
      sequenceNumber: Number(typedRow.seq_num),
      measureUnit: measureUnits[typedRow.measure_unit_id],
      modifier: typedRow.modifier,
      amount: Number(typedRow.amount),
      gramWeight: Number(typedRow.gram_weight),
    } as Portion)

    console.log(`Created Portion ${counter}`)
  }

  await buffer.flush()
}

export default loadPortionData
