/* eslint-disable import/prefer-default-export */
import { objectType } from "nexus"

export const Ingredient = objectType({
  name: "Ingredient",
  definition(t) {
    t.nonNull.int("id")
    t.nonNull.int("foodId")
    t.nonNull.float("amount")
    t.nonNull.string("measure")
    t.int("order")

    t.field("food", {
      type: "Food",
      resolve: ({ id }, _args, ctx) =>
        ctx.db.ingredient.findUnique({ where: { id } }).food(),
    })
  },
})
