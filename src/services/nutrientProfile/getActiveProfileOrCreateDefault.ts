import { PrismaClient } from "@prisma/client"
import { NutrientProfile } from ".prisma/client"
import createDefaultProfile from "./createDefaultProfile"
import getActiveProfile from "./getActiveProfile"

const getActiveProfileOrCreateDefault = async (
  userId: string,
  db: PrismaClient
): Promise<NutrientProfile> => {
  let profile = await getActiveProfile(userId, db)

  if (!profile) {
    profile = await createDefaultProfile(userId, db)
  }

  return profile
}

export default getActiveProfileOrCreateDefault
