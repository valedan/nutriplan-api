import { PrismaClient } from "@prisma/client"
import { NutrientTarget } from ".prisma/client"
import { NotFoundError } from "../../api/shared/errors"

interface Args {
  db: PrismaClient
  nutrientId: number
  nutrientProfileId: number
}

const getTargetByNutrientAndProfile = async ({
  db,
  nutrientId,
  nutrientProfileId,
}: Args): Promise<NutrientTarget> => {
  const target = await db.nutrientTarget.findFirst({
    where: { nutrientProfileId, nutrientId },
    include: { nutrientProfile: true },
  })

  if (!target) {
    throw new NotFoundError(
      `Target not found for nutrient ${nutrientId} and profile ${nutrientProfileId}`
    )
  }

  return target
}

export default getTargetByNutrientAndProfile
