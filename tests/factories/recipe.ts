import faker from "faker"
import _ from "lodash"
import { Recipe, Prisma } from ".prisma/client"
import db from "../../src/config/db"

const baseData = (): Prisma.RecipeUncheckedCreateInput => ({
  userId: faker.internet.email(),
  name: faker.music.genre(),
  servings: _.random(1, 10),
})

export const createRecipe = (
  data?: Partial<Recipe>
): Prisma.Prisma__RecipeClient<Recipe> =>
  db.recipe.create({
    data: {
      ...baseData(),
      ...data,
    },
  })

export const createRecipes = (
  count: number,
  data: Partial<Recipe>[] = []
): Promise<Recipe[]> =>
  Promise.all(
    Array(count)
      .fill(undefined)
      .map((_item, index) => createRecipe(data[index]))
  )
