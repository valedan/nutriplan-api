import _ from "lodash"
import { NutrientTarget, Prisma } from ".prisma/client"
import db from "../../src/config/db"

type NutrientTargetFactoryInput = Partial<NutrientTarget> & {
  nutrientId: number
  nutrientProfileId: number
}

const targetBaseData = (): Omit<
  Prisma.NutrientTargetUncheckedCreateInput,
  "nutrientId" | "nutrientProfileId"
> => ({
  min: _.random(1, 4) === 4 ? null : _.random(1, 100),
  max: _.random(1, 4) === 4 ? null : _.random(101, 200),
})

export const createNutrientTarget = (
  data: NutrientTargetFactoryInput
): Prisma.Prisma__NutrientTargetClient<NutrientTarget> =>
  db.nutrientTarget.create({
    data: {
      ...targetBaseData(),
      ...data,
    },
  })
