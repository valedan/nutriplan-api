import { Nutrient } from ".prisma/client"
import { NotFoundError } from "../../api/shared/errors"
import { MyContext } from "../../config/context"

const getNutrient = async (
  { db }: MyContext,
  id: number
): Promise<Nutrient> => {
  const nutrient = await db.nutrient.findUnique({
    where: { id },
  })
  // TODO: A bit weird to be throwing Apollo errors from service layer.
  // This should really live at the API layer.
  if (!nutrient) throw new NotFoundError("Nutrient not found")

  return nutrient
}

export default getNutrient
