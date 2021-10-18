import { Nutrient } from ".prisma/client"
import { MyContext } from "../../config/context"

const getAllNutrients = async ({ db }: MyContext): Promise<Nutrient[]> => {
  const nutrients = await db.nutrient.findMany()
  return nutrients
}

export default getAllNutrients
