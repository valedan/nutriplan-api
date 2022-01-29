import { Recipe } from ".prisma/client"
import { MyContext } from "../../config/context"
import { NexusGenInputs } from "../../config/nexus-typegen"

const createRecipe = async (
  input: NexusGenInputs["CreateRecipeInput"],
  { db, auth }: MyContext
): Promise<Recipe> => {
  const recipe = await db.recipe.create({
    data: { userId: auth.user.id, ...input },
  })

  return recipe
}

export default createRecipe
