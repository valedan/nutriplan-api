/* eslint-disable no-constant-condition */
/* eslint-disable no-await-in-loop */
import "dotenv/config"
import { Food, PrismaClient } from "@prisma/client"
import AppSearchClient from "@elastic/app-search-node"
import _ from "lodash"
import PQueue from "p-queue"

const ELASTIC_CHUNK_SIZE = 100

const queue = new PQueue({ concurrency: 20 })

let counter = 0
queue.on("next", () => {
  counter += 1
  console.log(
    `Documents indexed. Completed: ${counter * ELASTIC_CHUNK_SIZE} Remaining: ${
      queue.size * ELASTIC_CHUNK_SIZE + queue.pending * ELASTIC_CHUNK_SIZE
    }`
  )
})

const prisma = new PrismaClient()
const elastic = new AppSearchClient(
  undefined,
  process.env.ELASTIC_APP_SEARCH_API_KEY,
  () => process.env.ELASTIC_APP_SEARCH_URL ?? ""
)
// TODO: Need to map the DB columns to snake_case versions now that I've renamed them
const sendToElastic = (foods: Food[]) =>
  _.chunk(foods, ELASTIC_CHUNK_SIZE).forEach((chunk) => {
    void queue.add(async () => {
      let attempts = 0
      const maxRetries = 5

      while (true) {
        try {
          attempts += 1
          await elastic.indexDocuments("food", chunk)
          await prisma.food.updateMany({
            where: {
              id: { in: chunk.map((food) => food.id) },
            },
            data: {
              inElasticsearch: true,
            },
          })

          return
        } catch (e) {
          if (attempts > maxRetries) {
            throw e
          }
          console.error(`Error indexing chunk on attempt ${attempts}`, e)
        }
      }
    })
  })

const exportData = async () => {
  const baseQuery = {
    take: 10000,
    where: {
      historical: false,
      inElasticsearch: false,
    },
  }

  const firstFoods = await prisma.food.findMany({ ...baseQuery })
  sendToElastic(firstFoods)

  let cursor = firstFoods[firstFoods.length - 1].id
  while (true) {
    const foods = await prisma.food.findMany({
      skip: 1,
      cursor: {
        id: cursor,
      },
      ...baseQuery,
    })

    sendToElastic(foods)

    if (foods.length === 0) {
      break
    }

    cursor = foods[foods.length - 1].id
  }

  await queue.onIdle()
}

const syncData = async () => {
  await exportData()
}

syncData()
  .catch((e) => {
    throw e
  })
  .finally(() => {
    void prisma.$disconnect()
  })
