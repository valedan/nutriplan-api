import { Plan } from ".prisma/client"
import { NotFoundError } from "../../api/shared/errors"
import { MyContext } from "../../config/context"

const getPlan = async (id: number, { db, auth }: MyContext): Promise<Plan> => {
  const plan = await db.plan.findFirst({
    where: { id, userId: auth.user.id },
  })

  // A bit weird to be throwing Apollo errors from service layer.
  // This should really live at the API layer.
  if (!plan) throw new NotFoundError("Plan not found")
  return plan
}

export default getPlan
