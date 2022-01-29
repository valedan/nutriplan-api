import { Recipe } from ".prisma/client"
import { MyContext } from "../../config/context"
import { NotFoundError } from "../../api/shared/errors"

const deleteRecipe = async (
  id: number,
  { db, auth }: MyContext
): Promise<Recipe> => {
  const recipe = await db.recipe.findFirst({
    where: { id, userId: auth.user.id },
  })

  if (!recipe) {
    throw new NotFoundError("Recipe not found")
  }
  // TODO: Add handling for dependant meals!

  const deletedRecipe = await db.recipe.delete({
    where: { id },
  })

  return deletedRecipe
}

export default deleteRecipe
