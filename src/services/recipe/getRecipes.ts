import { Recipe } from ".prisma/client"
import { MyContext } from "../../config/context"

const getRecipes = async ({ db, auth }: MyContext): Promise<Recipe[]> =>
  db.recipe.findMany({ where: { userId: auth.user.id } })

export default getRecipes
