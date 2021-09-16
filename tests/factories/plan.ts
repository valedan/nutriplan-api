import faker from "faker"
import { Plan, Prisma } from ".prisma/client"
import db from "../../src/config/db"

const baseData = (): Prisma.PlanUncheckedCreateInput => ({
  userId: faker.internet.email(),
  name: faker.music.genre(),
  startDate: faker.date.past(),
  endDate: faker.date.future(),
})

export const createPlan = (
  data?: Partial<Plan>
): Prisma.Prisma__PlanClient<Plan> =>
  db.plan.create({
    data: {
      ...baseData(),
      ...data,
    },
  })

export const createPlans = (
  count: number,
  data: Partial<Plan>[] = []
): Promise<Plan[]> =>
  Promise.all(
    Array(count)
      .fill(undefined)
      .map((_item, index) => createPlan(data[index]))
  )
