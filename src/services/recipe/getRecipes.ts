import { Recipe } from ".prisma/client"
import { NotFoundError } from "../../api/shared/errors"
import { MyContext } from "../../config/context"

const getRecipes = async (
  ids: number[],
  { db, auth }: MyContext
): Promise<Recipe[]> => db.recipe.findMany({ where: { id: { in: ids } } })

export default getRecipes
