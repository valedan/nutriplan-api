import _ from "lodash"
import { Meal, Prisma } from ".prisma/client"
import db from "../../src/config/db"

type MealFactoryInput = Partial<Meal> & {
  planId: number
  recipeId: number
}

const baseData = (): Omit<
  Prisma.MealUncheckedCreateInput,
  "planId" | "recipeId"
> => ({
  servings: _.random(1, 10),
  order: _.random(1, 10),
})

export const createMeal = (
  data: MealFactoryInput
): Prisma.Prisma__MealClient<Meal> =>
  db.meal.create({
    data: {
      ...baseData(),
      ...data,
    },
  })

export const createMeals = (
  count: number,
  data: MealFactoryInput[] = []
): Promise<Meal[]> => {
  if (data.length !== count) {
    throw new Error("Must provide foreign keys for all meals")
  }

  return Promise.all(
    Array(count)
      .fill(undefined)
      .map((_item, index) => createMeal(data[index]))
  )
}
