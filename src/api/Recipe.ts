/* eslint-disable import/prefer-default-export */
import { objectType, nonNull, intArg, list, queryField } from "nexus"
import RecipeService from "../services/recipe"

export const getRecipe = queryField("recipe", {
  type: "Recipe",
  args: { id: nonNull(intArg()) },
  resolve: (_root, { id }, ctx) => RecipeService.getRecipe(id, ctx),
})

export const getRecipes = queryField("recipes", {
  type: nonNull(list(nonNull("Recipe"))),
  args: {
    ids: nonNull(list(nonNull(intArg()))),
  },
  resolve: (_root, { ids }, ctx) => RecipeService.getRecipes(ids, ctx),
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

// just scalar fields
// createRecipe

// just scalar fields
// updateRecipe

// deleteRecipe
