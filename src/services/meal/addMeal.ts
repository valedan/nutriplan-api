import { sumBy } from "lodash"
import { UserInputError } from "apollo-server"
import { Meal } from ".prisma/client"
import { MyContext } from "../../config/context"
import { NexusGenInputs } from "../../config/nexus-typegen"
import { NotFoundError } from "../../api/shared/errors"

const addMeal = async (
  input: NexusGenInputs["AddMealInput"],
  { db, auth }: MyContext
): Promise<Meal> => {
  const parent = await db.plan.findFirst({
    where: { id: input.planId, userId: auth.user.id },
    include: { _count: { select: { meals: true } } },
  })

  if (!parent) {
    throw new NotFoundError("Could not find parent")
  }

  const recipe = await db.recipe.findFirst({
    where: { id: input.recipeId, userId: auth.user.id },
    include: { ingredients: true },
  })

  if (!recipe) {
    throw new NotFoundError("Could not find recipe")
  }

  const meal = await db.meal.create({
    data: {
      planId: input.planId,
      recipeId: input.recipeId,
      servings: recipe.servings,
      order: parent._count?.meals || 0,
      ingredients: {
        create: recipe.ingredients.map((ingredient) => ({
          foodId: ingredient.foodId,
          amount: ingredient.amount,
          measure: ingredient.measure,
          order: ingredient.order,
        })),
      },
    },
    include: {
      ingredients: true,
    },
  })

  return meal
}

export default addMeal
