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
  gtinUpc: string
  count: number
}

// Find all gtinUpcs that have duplicates
// For each gtinUpc, find all foods with that gtinUpc
// For each food, set historical to true, except the one with the highest id
const flagHistoricalRecords = async (prisma: PrismaClient): Promise<void> => {
  // TODO: Update to handle camelCase properly?
  const results = await prisma.$queryRaw<DuplicateQueryResult[]>`
  SELECT gtinUpc, COUNT(*)
  FROM "public"."Food" food
  WHERE gtinUpc IS NOT NULL
  GROUP BY gtinUpc
  HAVING COUNT(*) > 1
  `

  const duplicateGtinIds = results.map((result) => result.gtinUpc)

  duplicateGtinIds.forEach((gtinId) => {
    void queue.add(async () => {
      const foods = await prisma.food.findMany({
        where: { gtinUpc: gtinId },
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
