import { PrismaClient } from "@prisma/client"
import PQueue from "p-queue"

const queue = new PQueue({ concurrency: 1000 })

let counter = 0
queue.on("next", () => {
  counter += 1
  console.log(
    `Duplicates flagged. Completed: ${counter} Remaining: ${
      queue.size + queue.pending
    }`
  )
})

type DuplicateQueryResult = {
  gtin_upc: string
  count: number
}

// Find all gtin_upcs that have duplicates
// For each gtin_upc, find all foods with that gtin_upc
// For each food, set historical to true, except the one with the highest id
const flagHistoricalRecords = async (prisma: PrismaClient): Promise<void> => {
  const results = await prisma.$queryRaw<DuplicateQueryResult[]>`
  SELECT gtin_upc, COUNT(*)
  FROM "public"."Food" food
  WHERE gtin_upc IS NOT NULL
  GROUP BY gtin_upc
  HAVING COUNT(*) > 1
  `

  const duplicateGtinIds = results.map((result) => result.gtin_upc)

  duplicateGtinIds.forEach((gtinId) => {
    void queue.add(async () => {
      const foods = await prisma.food.findMany({
        where: { gtin_upc: gtinId },
        orderBy: { id: "desc" },
      })

      await prisma.food.update({
        where: { id: foods[0].id },
        data: { historical: false },
      })

      const historicFoods = foods.slice(1)

      await prisma.food.updateMany({
        where: {
          id: {
            in: historicFoods.map((food) => food.id),
          },
        },
        data: { historical: true },
      })
    })
  })
  await queue.onIdle()
}

export default flagHistoricalRecords
