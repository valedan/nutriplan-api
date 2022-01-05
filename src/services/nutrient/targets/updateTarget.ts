import { PrismaClient } from "@prisma/client"
import { NutrientTarget } from ".prisma/client"
import { NotFoundError } from "../../../api/shared/errors"

interface UpdateTargetInput {
  db: PrismaClient
  id: number
  userId: string
  min?: number | null
  max?: number | null
}

const updateTarget = async ({
  db,
  id,
  userId,
  min,
  max,
}: UpdateTargetInput): Promise<NutrientTarget> => {
  const target = await db.nutrientTarget.findUnique({
    where: { id },
    include: { nutrientProfile: true },
  })

  if (!target || target.nutrientProfile.userId !== userId) {
    throw new NotFoundError("Target not found")
  }

  const newData: { min?: number | null; max?: number | null } = {}

  if (min !== undefined) {
    newData.min = min
  }

  if (max !== undefined) {
    newData.max = max
  }

  return db.nutrientTarget.update({
    where: { id },
    data: newData,
  })
}

export default updateTarget
