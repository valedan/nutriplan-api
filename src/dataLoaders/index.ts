import { PrismaClient } from "@prisma/client"
import createActiveProfileLoader from "./activeProfile"
import createTargetsByNutrientAndProfileLoader from "./targetsByNutrientAndProfile"

export const createLoaders = (db: PrismaClient, userId: string) => ({
  activeProfile: createActiveProfileLoader(db, userId),
  targetsByNutrientAndProfile: createTargetsByNutrientAndProfileLoader(db),
})
