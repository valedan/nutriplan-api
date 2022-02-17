import { sumBy } from "lodash"
import { UserInputError } from "apollo-server"
import { Ingredient } from ".prisma/client"
import { MyContext } from "../../config/context"
import { NexusGenInputs } from "../../config/nexus-typegen"
import { NotFoundError } from "../../api/shared/errors"

const addIngredient = async (
  input: NexusGenInputs["AddIngredientInput"],
  { db, auth }: MyContext
): Promise<Ingredient> => {
  let parent
  if (
    sumBy([input.planId, input.recipeId], (parentId) => (parentId ? 1 : 0)) !==
    1
  ) {
    throw new UserInputError("You must specify one parent")
  }

  if (input.planId) {
    parent = await db.plan.findFirst({
      where: { id: input.planId, userId: auth.user.id },
      include: { _count: { select: { ingredients: true } } },
    })
  } else if (input.recipeId) {
    parent = await db.recipe.findFirst({
      where: { id: input.recipeId, userId: auth.user.id },
      include: { _count: { select: { ingredients: true } } },
    })
  }

  if (!parent) {
    throw new NotFoundError("Could not find parent")
  }

  const ingredient = await db.ingredient.create({
    data: {
      foodId: input.foodId,
      // One of these will have an id, the other will be null
      planId: input.planId,
      recipeId: input.recipeId,
      amount: 1,
      measure: "g",
      order: parent._count?.ingredients || 0,
    },
  })
  return ingredient
}

export default addIngredient
