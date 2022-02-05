import { Nutrient } from ".prisma/client"
import { MyContext } from "../../config/context"

const getNutrients = async (
  { db }: MyContext,
  ids: number[] | null = []
): Promise<Nutrient[]> => {
  const nutrients = await db.nutrient.findMany({
    ...(ids?.length ? { where: { id: { in: ids } } } : {}),
  })
  return nutrients
}

export default getNutrients
