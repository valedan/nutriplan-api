import { Food } from ".prisma/client"
import { NotFoundError } from "../../api/shared/errors"
import { MyContext } from "../../config/context"

const getFood = async (id: number, { db }: MyContext): Promise<Food> => {
  const food = await db.food.findUnique({
    where: { id },
  })
  if (!food) throw new NotFoundError("Food")
  return food
}

export default getFood
