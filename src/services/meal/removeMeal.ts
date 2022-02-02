import { Meal } from ".prisma/client"
import { MyContext } from "../../config/context"
import { NotFoundError } from "../../api/shared/errors"

const removeMeal = async (
  id: number,
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

  await db.meal.delete({ where: { id } })

  const higherMeals = await db.meal.findMany({
    where: {
      planId: meal.planId,
      order: {
        gt: meal.order,
      },
    },
  })

  // TODO: parallelize this and ingredients!
  for await (const higherMeal of higherMeals) {
    await db.meal.update({
      where: { id: higherMeal.id },
      data: {
        order: higherMeal.order - 1,
      },
    })
  }

  return meal
}

export default removeMeal
