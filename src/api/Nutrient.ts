import { objectType, nonNull, list, queryField, intArg } from "nexus"
import NutrientService from "../services/nutrient"

export const getNutrient = queryField("nutrient", {
  type: "Nutrient",
  args: { id: nonNull(intArg()) },
  resolve: (_root, { id }, ctx) => NutrientService.getNutrient(ctx, id),
})

export const getNutrients = queryField("nutrients", {
  type: nonNull(list(nonNull("Nutrient"))),
  args: { ids: list(nonNull(intArg())) },
  resolve: (_root, { ids }, ctx) => NutrientService.getNutrients(ctx, ids),
})

export const Nutrient = objectType({
  name: "Nutrient",
  definition(t) {
    t.nonNull.int("id")
    t.nonNull.string("name")
    t.nonNull.string("unit")
    t.string("displayName")
    t.int("order")

    t.field("activeTarget", {
      type: "NutrientTarget",
      resolve: async ({ id }, _args, ctx) => {
        const activeProfile = await ctx.loaders.activeProfile.load("not used")
        return ctx.loaders.targetsByNutrientAndProfile.load({
          nutrientId: id,
          nutrientProfileId: activeProfile.id,
        })
      },
    })
  },
})
