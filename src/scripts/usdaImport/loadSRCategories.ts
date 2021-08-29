import { PrismaClient } from "@prisma/client"
import PQueue from "p-queue"
import { openFile } from "./utils"
import { SRGroupRow, SRFoodRow, SRLegacyFoodRow } from "./types"

const SR_GROUP_PATH = "./data/sr_groups.csv"
const SR_FOODS_PATH = "./data/sr_foods.csv"
const SR_LEGACY_FOODS_PATH = "./data/sr_legacy_food.csv"

const queue = new PQueue({ concurrency: 1000 })

let counter = 0
queue.on("next", () => {
  counter += 1
  console.log(
    `SR category loaded. Completed: ${counter} Remaining: ${
      queue.size + queue.pending
    }`
  )
})

// load groups from sr_groups
// load ndb_ids and group_ids from sr_foods
// load ndb_id and fdc_id from sr_legacy_food
// combine this data to create map of fdc_id -> group_name
// iterate through all prisma food items and add group_name
const loadSRCategories = async (prisma: PrismaClient): Promise<void> => {
  const groupFile = openFile(SR_GROUP_PATH)
  const groupMembershipsFile = openFile(SR_FOODS_PATH)
  const ndbFdcIdsFile = openFile(SR_LEGACY_FOODS_PATH)
  const groups: { [key: number]: string } = {}
  const groupMemberships: { [key: number]: number } = {}
  const foodGroups: { [key: number]: string } = {}

  for await (const row of groupFile) {
    const typedRow: SRGroupRow = row as SRGroupRow
    groups[Number(typedRow.id)] = typedRow.name
  }

  for await (const row of groupMembershipsFile) {
    const typedRow: SRFoodRow = row as SRFoodRow
    groupMemberships[Number(typedRow.ndb_id)] = Number(typedRow.group_id)
  }

  for await (const row of ndbFdcIdsFile) {
    const typedRow: SRLegacyFoodRow = row as SRLegacyFoodRow
    foodGroups[Number(typedRow.fdc_id)] =
      groups[groupMemberships[Number(typedRow.NDB_number)]]
  }

  const foods = await prisma.food.findMany({
    where: { data_source: "usda_sr_legacy_food" },
  })

  for await (const food of foods) {
    const foodGroup = foodGroups[food.id]
    void queue.add(() =>
      prisma.food.update({
        where: { id: food.id },
        data: { category: foodGroup },
      })
    )
  }

  await queue.onIdle()
}

export default loadSRCategories
