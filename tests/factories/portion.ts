import _ from "lodash"
import { Portion, Prisma } from ".prisma/client"
import db from "../../src/config/db"

const units = ["cup", "oz", "lb", "tablespoon", "teaspoon", "pinch", "fl oz"]

const modifiers = ["drained", "raw", "chopped", null]

type PortionFactoryInput = Partial<Portion> & {
  foodId: number
}

const baseData = (): Omit<Prisma.PortionUncheckedCreateInput, "foodId"> => ({
  sequenceNumber: _.random(1, 100),
  measureUnit: _.sample(units) || "cup",
  modifier: _.sample(modifiers),
  gramWeight: _.random(1, 1000),
  amount: _.random(1, 100),
})

export const createPortion = (
  data: PortionFactoryInput
): Prisma.Prisma__PortionClient<Portion> =>
  db.portion.create({
    data: {
      ...baseData(),
      ...data,
    },
  })

export const createPortions = (
  count: number,
  data: PortionFactoryInput[] = []
): Promise<Portion[]> => {
  if (data.length !== count) {
    throw new Error("Must provide food ids for all portions")
  }

  return Promise.all(
    Array(count)
      .fill(undefined)
      .map((_item, index) => createPortion(data[index]))
  )
}
