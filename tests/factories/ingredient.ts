import _ from "lodash"
import { Ingredient, Prisma } from ".prisma/client"
import db from "../../src/config/db"

type IngredientFactoryInput = Partial<Ingredient> & {
  foodId: number
}

const measures = ["cup", "oz", "lb", "tablespoon", "teaspoon", "pinch", "fl oz"]

const baseData = (): Omit<
  Prisma.IngredientUncheckedCreateInput,
  "planId" | "recipeId" | "mealId" | "foodId"
> => ({
  amount: _.random(1, 100),
  measure: _.sample(measures) || "cup",
  order: _.random(1, 10),
})

export const createIngredient = (
  data: IngredientFactoryInput
): Prisma.Prisma__IngredientClient<Ingredient> =>
  db.ingredient.create({
    data: {
      ...baseData(),
      ...data,
    },
  })

export const createIngredients = (
  count: number,
  data: IngredientFactoryInput[] = []
): Promise<Ingredient[]> => {
  if (data.length !== count) {
    throw new Error("Must provide foreign keys for all ingredients")
  }

  return Promise.all(
    Array(count)
      .fill(undefined)
      .map((_item, index) => createIngredient(data[index]))
  )
}
