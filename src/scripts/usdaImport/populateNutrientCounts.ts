/* eslint-disable no-await-in-loop */
/* eslint-disable no-constant-condition */
import { PrismaClient, Food } from "@prisma/client"
import PQueue from "p-queue"

const queue = new PQueue({ concurrency: 1000 })

let counter = 0
queue.on("next", () => {
  counter += 1
  console.log(
    `Count added. Completed: ${counter} Remaining: ${
      queue.size + queue.pending
    }`
  )
})

const performUpdate = (
  foods: (Food & {
    _count: {
      foodNutrients: number
    } | null
  })[],
  prisma: PrismaClient
) => {
  foods.forEach((food) => {
    void queue.add(async () => {
      await prisma.food.update({
        where: { id: food.id },
        data: {
          nutrientCount: food._count?.foodNutrients,
        },
      })
    })
  })
}

// For each food in db, get associated FoodNutrient count and add it
const populateNutrientCounts = async (
  prisma = new PrismaClient()
): Promise<void> => {
  const baseQuery = {
    where: { nutrientCount: 0 },
    take: 10000,
    include: {
      _count: {
        select: { foodNutrients: true },
      },
    },
  }

  const firstFoods = await prisma.food.findMany({ ...baseQuery })

  performUpdate(firstFoods, prisma)

  let cursor = firstFoods[firstFoods.length - 1].id

  while (true) {
    const foods = await prisma.food.findMany({
      skip: 1,
      cursor: {
        id: cursor,
      },
      ...baseQuery,
    })

    performUpdate(foods, prisma)

    if (foods.length === 0) {
      break
    }

    cursor = foods[foods.length - 1].id
  }

  await queue.onIdle()
}

export default populateNutrientCounts
