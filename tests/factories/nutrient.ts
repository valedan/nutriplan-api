import _ from "lodash"
import { Nutrient, NutrientUnit, Prisma } from ".prisma/client"
import db from "../../src/config/db"

const names = [
  "Calories",
  "Fat",
  "Carbohydrates",
  "Protein",
  "Sodium",
  "Fiber",
  "Cholesterol",
  "Vitamin A",
  "Vitamin C",
  "Calcium",
  "Iron",
]

const nutrientBaseData = (): Prisma.NutrientUncheckedCreateInput => ({
  name: _.sample(names) || "",
  unit: _.sample(NutrientUnit) || "G",
  nutrientNumber: _.random(1, 1000),
})

export const createNutrient = (
  data: Partial<Nutrient> = {}
): Prisma.Prisma__NutrientClient<Nutrient> =>
  db.nutrient.create({
    data: {
      ...nutrientBaseData(),
      ...data,
    },
  })

export const createNutrients = (
  count: number,
  data: Partial<Nutrient>[] = []
): Promise<Nutrient[]> =>
  Promise.all(
    Array(count)
      .fill(undefined)
      .map((_item, index) => createNutrient(data[index]))
  )
