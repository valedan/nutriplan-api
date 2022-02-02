import { omitBy, isNil } from "lodash"
import { Meal } from ".prisma/client"
import { MyContext } from "../../config/context"
import { NexusGenInputs } from "../../config/nexus-typegen"
import { NotFoundError } from "../../api/shared/errors"

const updateMeal = async (
  { id, ...updateData }: NexusGenInputs["UpdateMealInput"],
  { db, auth }: MyContext
): Promise<Meal> => {
  const userId = auth.user.id
  const meal = await db.meal.findFirst({
    where: { id },
    include: { plan: true },
  })

  if (!meal || meal.plan.userId !== userId) {
    throw new NotFoundError("Could not find meal")
  }

  return db.meal.update({
    where: { id },
    data: omitBy(updateData, isNil),
  })
}

export default updateMeal
