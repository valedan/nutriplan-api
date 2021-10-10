import { uniqBy } from "lodash"
import { Food, Portion as PortionModel } from ".prisma/client"
import { NotFoundError } from "../../api/shared/errors"
import { MyContext } from "../../config/context"
import { NexusGenFieldTypes } from "../../config/nexus-typegen"

type APIPortion = NexusGenFieldTypes["Portion"]
type FoodWithPortions = Food & {
  portions: PortionModel[]
}

const MEASURE_TRANSLATIONS = {
  tbsp: "tablespoon",
  tsp: "teaspoon",
}

const ML_PER_UNIT = {
  ml: 1,
  cup: 236.588,
  teaspoon: 4.9289,
  tablespoon: 14.7868,
  "fl oz": 29.5735,
  quart: 946.353,
}

const COMMON_WEIGHT_PORTIONS = [
  {
    measure: "g",
    gramWeight: 1,
  },
  {
    measure: "oz",
    gramWeight: 28.35,
  },
]

const normalizePortionMeasures = (portions: APIPortion[]) =>
  portions.map((portion) => {
    if (
      MEASURE_TRANSLATIONS[portion.measure as keyof typeof MEASURE_TRANSLATIONS]
    ) {
      return {
        ...portion,
        measure:
          MEASURE_TRANSLATIONS[
            portion.measure as keyof typeof MEASURE_TRANSLATIONS
          ],
      }
    }
    return portion
  })

const normalizeMeasure = (measure: string) => {
  if (MEASURE_TRANSLATIONS[measure as keyof typeof MEASURE_TRANSLATIONS]) {
    return MEASURE_TRANSLATIONS[measure as keyof typeof MEASURE_TRANSLATIONS]
  }
  return measure
}

const formatMeasureForPortion = (portion: PortionModel) => {
  let measure = portion.modifier
    ? `${portion.measureUnit}, ${portion.modifier}`
    : portion.measureUnit

  if (portion.amount !== 1) {
    measure = `serving (${portion.amount} ${measure})`
  }

  return measure
}

const addDBPortions = (portions: APIPortion[], food: FoodWithPortions) => {
  const dbPortions = food.portions
    .sort((portion) => portion.sequenceNumber)
    .map((portion) => ({
      measure: formatMeasureForPortion(portion),
      gramWeight: portion.gramWeight,
    }))

  return [...portions, ...dbPortions]
}

const liquidPortions = (knownLiquidPortion: PortionModel) => {
  const gramsPerUnit = knownLiquidPortion.gramWeight / knownLiquidPortion.amount

  const gramsPerML =
    gramsPerUnit /
    ML_PER_UNIT[
      normalizeMeasure(
        knownLiquidPortion.measureUnit
      ) as keyof typeof ML_PER_UNIT
    ]

  return Object.keys(ML_PER_UNIT).map((liquidMeasure) => ({
    measure: liquidMeasure,
    gramWeight:
      gramsPerML * ML_PER_UNIT[liquidMeasure as keyof typeof ML_PER_UNIT],
  }))
}

const addServingSizePortion = (
  portions: APIPortion[],
  food: FoodWithPortions
) => {
  if (food.servingSize && food.servingSizeUnit) {
    return [
      ...portions,
      {
        measure: food.servingSizeDescription || "serving",
        gramWeight: food.servingSize,
      },
    ]
  }

  return portions
}

const addLiquidPortions = (portions: APIPortion[], food: FoodWithPortions) => {
  const knownLiquidPortion = food.portions.find(
    (p) =>
      p.measureUnit &&
      Object.keys(ML_PER_UNIT)
        // cup is frequently used for chopped foods, so don't add liquid measures just because cup is present
        .filter((unit) => unit !== "cup")
        .includes(normalizeMeasure(p.measureUnit))
  )

  if (knownLiquidPortion) {
    return [...portions, ...liquidPortions(knownLiquidPortion)]
  }
  return portions
}

const addCommonWeightPortions = (portions: APIPortion[]) => [
  ...COMMON_WEIGHT_PORTIONS,
  ...portions,
]

const getPortionsForFood = async (
  id: number,
  { db }: MyContext
): Promise<APIPortion[]> => {
  const food = await db.food.findUnique({
    where: { id },
    include: {
      portions: true,
    },
  })

  if (!food) throw new NotFoundError("Food")

  let portions: APIPortion[] = []

  portions = addDBPortions(portions, food)
  portions = addServingSizePortion(portions, food)
  portions = normalizePortionMeasures(portions)
  portions = addCommonWeightPortions(portions)
  portions = addLiquidPortions(portions, food)

  return uniqBy(portions, (portion) => portion.measure)
}

export default getPortionsForFood
