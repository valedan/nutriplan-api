/* eslint-disable import/prefer-default-export */
import { objectType, nonNull, intArg, list, queryField } from "nexus"

export const RecipesQuery = queryField("recipes", {
  type: nonNull(list(nonNull("Recipe"))),
  args: {
    ids: nonNull(list(nonNull(intArg()))),
  },
  resolve: (_root, { ids }, ctx) =>
    ctx.db.recipe.findMany({ where: { id: { in: ids } } }),
})

export const RecipeQuery = queryField("recipe", {
  type: "Recipe",
  args: { id: nonNull(intArg()) },
  resolve: (_root, { id }, ctx) => ctx.db.recipe.findUnique({ where: { id } }),
})

export const Recipe = objectType({
  name: "Recipe",
  definition(t) {
    t.nonNull.int("id")
    t.string("name")
    t.int("servings")

    t.field("meals", {
      type: nonNull(list(nonNull("Meal"))),
      resolve: ({ id }, _args, ctx) =>
        ctx.db.recipe.findUnique({ where: { id } }).meals(),
    })

    t.field("ingredients", {
      type: nonNull(list(nonNull("Ingredient"))),
      resolve: ({ id }, _args, ctx) =>
        ctx.db.recipe.findUnique({ where: { id } }).ingredients(),
    })
  },
})
