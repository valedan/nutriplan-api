import "dotenv/config";
import { Food, PrismaClient } from "@prisma/client";
import AppSearchClient from "@elastic/app-search-node";

const ELASTIC_BUFFER_SIZE = 10;
const RECORD_LIMIT = 1000;
const LAST_SYNC_DATE = new Date("2021-08-21");

const prisma = new PrismaClient();
const elastic = new AppSearchClient(
  undefined,
  process.env.ELASTIC_APP_SEARCH_API_KEY,
  () => process.env.ELASTIC_APP_SEARCH_URL ?? ""
);

const sendToElastic = async (foods: Food[]) => {
  await elastic.indexDocuments("food", foods);
  console.log("sent to elastic");
};

// const exportData = async () => {
//   const foods = await prisma.food.findMany({ skip: 533600 });
//   let buffer = [];
//   let counter = 0;
//   for await (const food of foods) {
//     counter += 1;
//     if (buffer.length > ELASTIC_BUFFER_SIZE) {
//       await sendToElastic(buffer);
//       buffer = [];
//     }
//     console.log(counter);
//     buffer.push(food);
//   }
//   await sendToElastic(buffer);
// };
// 2827

// Find all prisma foods updated after last sync date
// Update elastic with those foods (some will be created)
// Get list of ids in elastic
// Get list of ids in prisma
// Compare
// Delete superfluous documents in elastic

const newFoodRecords = async () => {
  const newFoods = await prisma.food.findMany({ where: { updated_at: { gt: LAST_SYNC_DATE } } });
  let buffer = [];
  let counter = 0;
  for await (const food of newFoods) {
    counter += 1;
    if (buffer.length > ELASTIC_BUFFER_SIZE) {
      await sendToElastic(buffer);
      buffer = [];
    }
    console.log(counter, food.id);
    buffer.push(food);
  }
  await sendToElastic(buffer);
};

const deletedRecords = async () => {};

const syncData = async () => {
  await newFoodRecords();
};

syncData()
  .catch((e) => {
    throw e;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
