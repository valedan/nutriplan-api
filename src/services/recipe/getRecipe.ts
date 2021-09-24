import { Recipe } from ".prisma/client"
import { MyContext } from "../../config/context"

const getRecipe = async (
  id: number,
  { db }: MyContext
): Promise<Recipe | null> => db.recipe.findUnique({ where: { id } })

export default getRecipe
