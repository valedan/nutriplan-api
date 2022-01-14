import DataLoader from "dataloader"
import { uniq } from "lodash"
import objectHash from "object-hash"
import { NutrientTarget, PrismaClient } from ".prisma/client"

const createTargetsByNutrientAndProfileLoader = (
  db: PrismaClient
): DataLoader<unknown, NutrientTarget, unknown> =>
  new DataLoader(
    (ids: readonly { nutrientId: number; nutrientProfileId: number }[]) => {
      const nutrientIds = ids.map(({ nutrientId }) => nutrientId)
      const nutrientProfileIds = uniq(
        ids.map(({ nutrientProfileId }) => nutrientProfileId)
      )
      if (nutrientProfileIds.length !== 1) {
        throw new Error("Targets must be loaded from the same profile")
      }

      return db.nutrientTarget.findMany({
        where: {
          nutrientProfileId: nutrientProfileIds[0],
          nutrientId: {
            in: nutrientIds,
          },
        },
      })
    },
    { cacheKeyFn: objectHash }
  )

export default createTargetsByNutrientAndProfileLoader
