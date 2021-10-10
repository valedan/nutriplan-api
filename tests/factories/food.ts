import _ from "lodash"
import { Food, Prisma } from ".prisma/client"
import db from "../../src/config/db"

const foodDescriptions = [
  "Pizza",
  "Burger",
  "Chips",
  "Cake",
  "Coffee",
  "Tea",
  "Soda",
  "Juice",
  "Milk",
  "Water",
  "Tacos",
  "Sandwich",
  "Salad",
  "Soup",
]

const dataSources = [
  "usda_sr_legacy_food",
  "usda_branded_food",
  "usda_foundation_food",
]

const foodBaseData = (): Prisma.FoodUncheckedCreateInput => ({
  dataSource: _.sample(dataSources) || "source",
  description: _.sample(foodDescriptions) || "food",
})

export const createFood = (
  data: Partial<Food> = {}
): Prisma.Prisma__FoodClient<Food> =>
  db.food.create({
    data: {
      ...foodBaseData(),
      ...data,
    },
  })

// Doing one at a time because createMany does not return the created objects
// I could work around by precomputing the ids and then doing a findMany after create
// But that has a chance of errors because I'm using int ids
// If I ever move to UUIDs or if createMany gets improved, change this.
export const createFoods = (
  count: number,
  data: Partial<Food>[] = []
): Promise<Food[]> =>
  Promise.all(
    Array(count)
      .fill(undefined)
      .map((_item, index) => createFood(data[index]))
  )
