import { FoodNutrient } from ".prisma/client"
import { MyContext } from "../../config/context"
import NutrientService from "../nutrient"

const getFoodNutrientsForFood = async (
  ctx: MyContext,
  foodId: number,
  nutrientIds?: number[] | null
): Promise<FoodNutrient[]> => {
  let nutrientIdsToUse = []
  if (nutrientIds && nutrientIds.length > 0) {
    nutrientIdsToUse = nutrientIds
  } else {
    // If client did not specify any nutrientIds, get the defaults
    // Default currently is anything that belongs to a NutrientGroup
    nutrientIdsToUse = (await NutrientService.getDefaultNutrients(ctx)).map(
      (n) => n.id
    )
  }
  return ctx.db.food.findUnique({ where: { id: foodId } }).foodNutrients({
    where: { nutrientId: { in: nutrientIdsToUse } },
  })
}

export default getFoodNutrientsForFood
