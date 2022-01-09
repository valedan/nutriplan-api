import { NutrientGroup } from ".prisma/client"
import { MyContext } from "../../config/context"

const getAllNutrientGroups = async ({
  db,
}: MyContext): Promise<NutrientGroup[]> => {
  const nutrientGroups = await db.nutrientGroup.findMany()
  return nutrientGroups
}

export default getAllNutrientGroups
