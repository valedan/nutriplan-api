import { Plan } from ".prisma/client"
import { NotFoundError } from "../../api/shared/errors"
import { MyContext } from "../../config/context"

const getPlan = async (id: number, { db, auth }: MyContext): Promise<Plan> => {
  const plan = await db.plan.findFirst({
    where: { id, userId: auth.user.id },
  })
  if (!plan) throw new NotFoundError("Plan")
  return plan
}

export default getPlan
