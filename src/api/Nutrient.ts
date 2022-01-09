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
  },
})
