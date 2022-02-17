import { Nutrient } from ".prisma/client"
import { MyContext } from "../../config/context"

const getDefaultNutrients = async ({ db }: MyContext): Promise<Nutrient[]> => {
  const nutrients = await db.nutrient.findMany({
    where: {
      nutrientGroupId: { not: null },
    },
  })
  return nutrients
}

export default getDefaultNutrients
