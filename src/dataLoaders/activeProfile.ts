import DataLoader from "dataloader"
import { NutrientProfile, PrismaClient } from ".prisma/client"
import getActiveProfileOrCreateDefault from "../services/nutrientProfile/getActiveProfileOrCreateDefault"

const createActiveProfileLoader = (
  db: PrismaClient,
  userId: string
): DataLoader<unknown, NutrientProfile, unknown> =>
  new DataLoader(async () => [
    await getActiveProfileOrCreateDefault(userId, db),
  ])

export default createActiveProfileLoader
