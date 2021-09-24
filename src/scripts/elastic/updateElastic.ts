import "dotenv/config"
import { Food, PrismaClient } from "@prisma/client"
import AppSearchClient from "@elastic/app-search-node"

const ELASTIC_BUFFER_SIZE = 10
const LAST_SYNC_DATE = new Date("2021-08-29T15:00:00Z")

const prisma = new PrismaClient()
const elastic = new AppSearchClient(
  undefined,
  process.env.ELASTIC_APP_SEARCH_API_KEY,
  () => process.env.ELASTIC_APP_SEARCH_URL ?? ""
)

const sendToElastic = async (foods: Food[]) => {
  await elastic.indexDocuments("food", foods)
  console.log("sent to elastic")
}

// TODO: modify this to use p-queue like the other scripts next time I'm doing a huge update
const newFoodRecords = async () => {
  const newFoods = await prisma.food.findMany({
    where: { updatedAt: { gt: LAST_SYNC_DATE } },
  })

  let buffer = []
  let counter = 0

  for await (const food of newFoods) {
    counter += 1
    if (buffer.length > ELASTIC_BUFFER_SIZE) {
      await sendToElastic(buffer)
      buffer = []
    }
    console.log(counter, food.id)
    buffer.push(food)
  }

  await sendToElastic(buffer)
}

const syncData = async () => {
  await newFoodRecords()
}

syncData()
  .catch((e) => {
    throw e
  })
  .finally(() => {
    void prisma.$disconnect()
  })
