import { Recipe } from ".prisma/client"
import { MyContext } from "../../config/context"

const getRecipes = async (
  ids: number[],
  { db }: MyContext
): Promise<Recipe[]> => db.recipe.findMany({ where: { id: { in: ids } } })

export default getRecipes
