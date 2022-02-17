import { PrismaClient } from "@prisma/client"
import { NutrientProfile } from ".prisma/client"

const getActiveProfile = async (
  userId: string,
  db: PrismaClient
): Promise<NutrientProfile | null> => {
  const profiles = await db.nutrientProfile.findMany({
    where: { userId },
  })

  const activeProfile = profiles.find((profile) => profile.isActive)

  if (!activeProfile && profiles.length > 0) {
    const newActiveProfile = await db.nutrientProfile.update({
      where: { id: profiles[0].id },
      data: { isActive: true },
    })

    return newActiveProfile
  }

  return activeProfile || null
}

export default getActiveProfile
