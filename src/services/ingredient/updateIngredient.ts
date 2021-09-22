import { sumBy, omitBy, isNil } from "lodash"
import { UserInputError } from "apollo-server"
import { Ingredient } from ".prisma/client"
import { MyContext } from "../../config/context"
import { NexusGenInputs } from "../../config/nexus-typegen"
import { NotFoundError } from "../../api/shared/errors"

const updateIngredient = async (
  { id, ...updateData }: NexusGenInputs["UpdateIngredientInput"],
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

  return db.ingredient.update({
    where: { id },
    data: omitBy(updateData, isNil),
  })
}

export default updateIngredient
