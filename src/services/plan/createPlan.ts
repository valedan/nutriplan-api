import { Plan } from ".prisma/client"
import { MyContext } from "../../config/context"
import { NexusGenInputs } from "../../config/nexus-typegen"

const createPlan = async (
  input: NexusGenInputs["CreatePlanInput"],
  { db, auth }: MyContext
): Promise<Plan> => {
  const plan = await db.plan.create({
    data: { userId: auth.user.id, ...input },
  })
  return plan
}

export default createPlan
