import { Food } from ".prisma/client"
import { MyContext } from "../../config/context"

const getFoods = async (ids: number[], { db }: MyContext): Promise<Food[]> => {
  const foods = await db.food.findMany({ where: { id: { in: ids } } })

  return foods
}

export default getFoods
