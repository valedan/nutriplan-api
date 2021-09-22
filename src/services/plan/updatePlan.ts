import { omitBy, isNil } from "lodash"
import { Plan } from ".prisma/client"
import { MyContext } from "../../config/context"
import { NotFoundError } from "../../api/shared/errors"
import { NexusGenInputs } from "../../config/nexus-typegen"

const updatePlan = async (
  { id, ...updateData }: NexusGenInputs["UpdatePlanInput"],
  { db, auth }: MyContext
): Promise<Plan> => {
  // the `where` arg for `update` only accepts unique fields, so can't put userId in it
  const plan = await db.plan.findFirst({
    where: { id, userId: auth.user.id },
  })

  if (!plan) {
    throw new NotFoundError("Plan not found")
  }

  const updatedPlan = await db.plan.update({
    where: { id },
    // The fields are optional but non-nullable. No option for this in Nexus, so strip null values here
    data: omitBy(updateData, isNil),
  })

  return updatedPlan
}

export default updatePlan
