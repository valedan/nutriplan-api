import DataLoader from "dataloader"
import { uniq } from "lodash"
import objectHash from "object-hash"
import { NutrientTarget, PrismaClient } from ".prisma/client"
import { sortByKeys } from "../utils"

const createTargetsByNutrientAndProfileLoader = (
  db: PrismaClient
): DataLoader<unknown, NutrientTarget | null, unknown> =>
  new DataLoader(
    async (
      ids: readonly { nutrientId: number; nutrientProfileId: number }[]
    ) => {
      const nutrientIds = ids.map(({ nutrientId }) => nutrientId)
      const nutrientProfileIds = uniq(
        ids.map(({ nutrientProfileId }) => nutrientProfileId)
      )
      if (nutrientProfileIds.length !== 1) {
        throw new Error("Targets must be loaded from the same profile")
      }

      const result = await db.nutrientTarget.findMany({
        where: {
          nutrientProfileId: nutrientProfileIds[0],
          nutrientId: {
            in: nutrientIds,
          },
        },
      })

      const sortedResult = sortByKeys(
        ids.map(({ nutrientId }) => nutrientId),
        result,
        "nutrientId"
      )

      return sortedResult
    },
    { cacheKeyFn: objectHash }
  )

export default createTargetsByNutrientAndProfileLoader
