import { PrismaClient } from "@prisma/client"
import PQueue from "p-queue"
import { openFile } from "./utils"
import { SRLegacyFoodRow, SRWeightRow } from "./types"

const SR_WEIGHTS_PATH = "./data/sr_weights.csv"
const SR_LEGACY_FOODS_PATH = "./data/sr_legacy_food.csv"

const queue = new PQueue({ concurrency: 1000 })

let counter = 0
queue.on("next", () => {
  counter += 1
  console.log(
    `SR Weight loaded. Completed: ${counter} Remaining: ${
      queue.size + queue.pending
    }`
  )
})

const loadSRWeights = async (prisma: PrismaClient): Promise<void> => {
  const weightsFile = openFile(SR_WEIGHTS_PATH)
  const ndbFdcIdsFile = openFile(SR_LEGACY_FOODS_PATH)
  const ndbIdMap: { [key: number]: number } = {}

  for await (const row of ndbFdcIdsFile) {
    const typedRow: SRLegacyFoodRow = row as SRLegacyFoodRow
    ndbIdMap[Number(typedRow.NDB_number)] = Number(typedRow.fdc_id)
  }

  for await (const row of weightsFile) {
    const typedRow: SRWeightRow = row as SRWeightRow
    void queue.add(() =>
      prisma.portion.create({
        data: {
          foodId: ndbIdMap[Number(typedRow.NDB_No)],
          amount: Number(typedRow.Amount),
          sequenceNumber: Number(typedRow.Seq),
          measureUnit: typedRow.Msre_Desc,
          gramWeight: Number(typedRow.Gm_Wgt),
        },
      })
    )
  }

  await queue.onIdle()
}

export default loadSRWeights
