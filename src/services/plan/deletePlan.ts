import { Plan } from ".prisma/client"
import { MyContext } from "../../config/context"
import { NotFoundError } from "../../api/shared/errors"

const deletePlan = async (
  id: number,
  { db, auth }: MyContext
): Promise<Plan> => {
  const plan = await db.plan.findFirst({
    where: { id, userId: auth.user.id },
  })

  if (!plan) {
    throw new NotFoundError("Plan not found")
  }

  const deletedPlan = await db.plan.delete({
    where: { id },
  })

  return deletedPlan
}

export default deletePlan
