/* eslint-disable import/prefer-default-export */
import { objectType, nonNull, list, queryField } from "nexus"
import NutrientGroupService from "../services/nutrientGroup"

export const getNutrientGroups = queryField("nutrientGroups", {
  type: nonNull(list(nonNull("NutrientGroup"))),
  resolve: (_root, _args, ctx) =>
    NutrientGroupService.getAllNutrientGroups(ctx),
})

// TYPES

export const NutrientGroup = objectType({
  name: "NutrientGroup",
  definition(t) {
    t.nonNull.int("id")
    t.nonNull.int("order")
    t.nonNull.string("name")

    t.field("nutrients", {
      type: nonNull(list(nonNull("Nutrient"))),
      resolve: ({ id }, _args, ctx) =>
        ctx.db.nutrientGroup.findUnique({ where: { id } }).nutrients(),
    })
  },
})
