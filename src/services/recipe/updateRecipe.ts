import { omitBy, isNil } from "lodash"
import { Recipe } from ".prisma/client"
import { MyContext } from "../../config/context"
import { NotFoundError } from "../../api/shared/errors"
import { NexusGenInputs } from "../../config/nexus-typegen"

const updateRecipe = async (
  { id, ...updateData }: NexusGenInputs["UpdateRecipeInput"],
  { db, auth }: MyContext
): Promise<Recipe> => {
  // the `where` arg for `update` only accepts unique fields, so can't put userId in it
  const recipe = await db.recipe.findFirst({
    where: { id, userId: auth.user.id },
  })

  if (!recipe) {
    throw new NotFoundError("Recipe not found")
  }

  const updatedRecipe = await db.recipe.update({
    where: { id },
    // The fields are optional but non-nullable. No option for this in Nexus, so strip null values here
    data: omitBy(updateData, isNil),
  })

  return updatedRecipe
}

export default updateRecipe
