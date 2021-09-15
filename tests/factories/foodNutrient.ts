import _ from "lodash"
import { FoodNutrient, Prisma } from ".prisma/client"
import db from "../../src/config/db"

type FoodNutrientFactoryInput = Partial<FoodNutrient> & {
  foodId: number
  nutrientId: number
}

export const createFoodNutrient = (
  data: FoodNutrientFactoryInput
): Prisma.Prisma__FoodNutrientClient<FoodNutrient> =>
  db.foodNutrient.create({
    data: {
      amount: _.random(1, 100),
      ...data,
    },
  })

export const createFoodNutrients = (
  count: number,
  data: FoodNutrientFactoryInput[] = []
): Promise<FoodNutrient[]> => {
  if (data.length !== count) {
    throw new Error("Must provide foreign keys for all food nutrients")
  }

  return Promise.all(
    Array(count)
      .fill(undefined)
      .map((_item, index) => createFoodNutrient(data[index]))
  )
}
