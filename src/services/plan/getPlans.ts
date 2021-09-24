import { Plan } from ".prisma/client"
import { MyContext } from "../../config/context"

const getPlans = ({ db, auth }: MyContext): Promise<Plan[]> =>
  db.plan.findMany({ where: { userId: auth.user.id } })

export default getPlans
