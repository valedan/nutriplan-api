import { Ingredient } from ".prisma/client"
import { MyContext } from "../../config/context"
import { NotFoundError } from "../../api/shared/errors"

const removeIngredient = async (
  id: number,
  { db, auth }: MyContext
): Promise<Ingredient> => {
  const userId = auth.user.id
  const ingredient = await db.ingredient.findFirst({
    where: { id },
    include: { plan: true, recipe: true },
  })

  if (
    !ingredient ||
    (ingredient.plan && ingredient.plan.userId !== userId) ||
    (ingredient.recipe && ingredient.recipe.userId !== userId)
  ) {
    throw new NotFoundError("Could not find ingredient")
  }

  await db.ingredient.delete({ where: { id } })

  const higherIngredients = await db.ingredient.findMany({
    where: {
      planId: ingredient.planId,
      recipeId: ingredient.recipeId,
      order: {
        gt: ingredient.order,
      },
    },
  })
  for await (const higherIngredient of higherIngredients) {
    await db.ingredient.update({
      where: { id: higherIngredient.id },
      data: {
        order: higherIngredient.order - 1,
      },
    })
  }

  return ingredient
}

export default removeIngredient
