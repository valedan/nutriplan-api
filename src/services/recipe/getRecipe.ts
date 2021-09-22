import { Recipe } from ".prisma/client"
import { NotFoundError } from "../../api/shared/errors"
import { MyContext } from "../../config/context"

const getRecipe = async (
  id: number,
  { db, auth }: MyContext
): Promise<Recipe | null> => db.recipe.findUnique({ where: { id } })

export default getRecipe
