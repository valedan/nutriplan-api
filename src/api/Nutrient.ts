import { objectType, nonNull, list, queryField } from "nexus"
import NutrientService from "../services/nutrient"

export const getNutrients = queryField("nutrients", {
  type: nonNull(list(nonNull("Nutrient"))),
  resolve: (_root, _args, ctx) => NutrientService.getAllNutrients(ctx),
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
      type: nonNull("NutrientTarget"),
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
