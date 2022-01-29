/* eslint-disable import/prefer-default-export */
import {
  objectType,
  nonNull,
  intArg,
  list,
  queryField,
  inputObjectType,
  mutationField,
} from "nexus"
import RecipeService from "../services/recipe"

// INPUTS

export const CreateRecipeInput = inputObjectType({
  name: "CreateRecipeInput",
  definition(t) {
    t.nonNull.string("name")
    t.nonNull.int("servings")
  },
})

export const UpdateRecipeInput = inputObjectType({
  name: "UpdateRecipeInput",
  definition(t) {
    t.nonNull.int("id")
    t.string("name")
    t.int("servings")
  },
})

// QUERIES

export const getRecipe = queryField("recipe", {
  type: "Recipe",
  args: { id: nonNull(intArg()) },
  resolve: (_root, { id }, ctx) => RecipeService.getRecipe(id, ctx),
})

export const getRecipes = queryField("recipes", {
  type: nonNull(list(nonNull("Recipe"))),
  resolve: (_root, _args, ctx) => RecipeService.getRecipes(ctx),
})

export const createRecipe = mutationField("createRecipe", {
  type: "Recipe",
  args: { input: nonNull(CreateRecipeInput) },
  resolve: (_root, { input }, ctx) => RecipeService.createRecipe(input, ctx),
})

export const updateRecipe = mutationField("updateRecipe", {
  type: "Recipe",
  args: { input: nonNull(UpdateRecipeInput) },
  resolve: (_root, { input }, ctx) => RecipeService.updateRecipe(input, ctx),
})

export const deleteRecipe = mutationField("deleteRecipe", {
  type: "Recipe",
  args: { id: nonNull(intArg()) },
  resolve: (_root, { id }: { id: number }, ctx) =>
    RecipeService.deleteRecipe(id, ctx),
})

// TYPES

export const Recipe = objectType({
  name: "Recipe",
  definition(t) {
    t.nonNull.int("id")
    t.string("name")
    t.int("servings")
    t.nonNull.datetime("createdAt")
    // TODO: Adding or changing ingredients should touch the recipe
    t.nonNull.datetime("updatedAt")

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
