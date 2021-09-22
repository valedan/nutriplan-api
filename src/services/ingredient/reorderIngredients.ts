import { sumBy, omitBy, isNil } from "lodash"
import { UserInputError } from "apollo-server"
import { Ingredient } from ".prisma/client"
import { MyContext } from "../../config/context"
import { NexusGenInputs } from "../../config/nexus-typegen"
import { NotFoundError } from "../../api/shared/errors"

const reorderIngredients = async (
  input: NexusGenInputs["ReorderIngredientsInput"],
  { db, auth }: MyContext
): Promise<Ingredient[]> => {
  const userId = auth.user.id
  let parent
  if (input.parentType === "plan") {
    parent = await db.plan.findFirst({
      where: { id: input.parentId, userId },
      include: { ingredients: true },
    })
  } else if (input.parentType === "recipe") {
    parent = await db.recipe.findFirst({
      where: { id: input.parentId, userId },
      include: { ingredients: true },
    })
  }

  if (!parent) {
    throw new NotFoundError("Could not find parent")
  }

  const currentSequence = parent.ingredients
    .sort(({ order }) => order)
    .map(({ id }) => id)

  const newSequence = [...currentSequence]
  input.reorders.forEach(({ id, newOrder }) => {
    if (!currentSequence.includes(id)) {
      throw new UserInputError("Invalid ingredient id")
    }

    const ingredientToMove = newSequence.splice(newSequence.indexOf(id), 1)[0]
    newSequence.splice(newOrder, 0, ingredientToMove)
  })

  const updatedIngredients = await Promise.all(
    newSequence.map((id, order) =>
      db.ingredient.update({
        where: { id },
        data: { order },
      })
    )
  )

  return updatedIngredients
}

export default reorderIngredients
