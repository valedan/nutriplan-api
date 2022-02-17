import { Recipe } from ".prisma/client"
import { NotFoundError } from "../../api/shared/errors"
import { MyContext } from "../../config/context"

const getRecipe = async (
  id: number,
  { db, auth }: MyContext
): Promise<Recipe | null> => {
  const recipe = await db.recipe.findFirst({
    where: { id, userId: auth.user.id },
  })

  // A bit weird to be throwing Apollo errors from service layer.
  // This should really live at the API layer.
  if (!recipe) throw new NotFoundError("Recipe not found")
  return recipe
}

export default getRecipe
