import { objectType, nonNull, list, queryField } from "nexus"
import ProfileService from "../services/nutrient/profiles"

export const getActiveProfile = queryField("activeNutrientProfile", {
  type: nonNull("NutrientProfile"),
  resolve: (_root, _, ctx) =>
    ProfileService.getActiveProfileOrCreateDefault(ctx.auth.user.id, ctx.db),
})

export const NutrientProfile = objectType({
  name: "NutrientProfile",
  definition(t) {
    t.nonNull.int("id")
    t.nonNull.datetime("createdAt")
    t.nonNull.datetime("updatedAt")
    t.nonNull.string("name")
    t.nonNull.boolean("isActive")

    t.field("nutrientTargets", {
      type: nonNull(list(nonNull("NutrientTarget"))),
      resolve: ({ id }, _args, ctx) =>
        ctx.db.nutrientProfile.findUnique({ where: { id } }).nutrientTargets(),
    })
  },
})
