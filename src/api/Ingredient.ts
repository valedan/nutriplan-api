import {
  nonNull,
  intArg,
  list,
  mutationField,
  objectType,
  inputObjectType,
  enumType,
} from "nexus"
import IngredientService from "../services/ingredient"
import { NotFoundError } from "./shared/errors"

export const addIngredientInput = inputObjectType({
  name: "AddIngredientInput",
  definition(t) {
    t.nonNull.int("foodId")
    t.int("planId")
    t.int("recipeId")
  },
})

export const updateIngredientInput = inputObjectType({
  name: "UpdateIngredientInput",
  definition(t) {
    t.nonNull.int("id")
    t.float("amount")
    t.string("measure")
  },
})

export const IngredientReorder = inputObjectType({
  name: "IngredientReorder",
  definition(t) {
    t.nonNull.int("id")
    t.nonNull.int("newOrder")
  },
})

export const IngredientParent = enumType({
  name: "IngredientParent",
  members: ["plan", "recipe"],
})

export const reorderIngredientsInput = inputObjectType({
  name: "ReorderIngredientsInput",
  definition(t) {
    t.nonNull.field("parentType", { type: "IngredientParent" })
    t.nonNull.int("parentId")
    t.nonNull.list.field("reorders", { type: nonNull("IngredientReorder") })
  },
})

export const addIngredient = mutationField("addIngredient", {
  type: "Ingredient",
  args: { input: nonNull(addIngredientInput) },
  resolve: (_, { input }, ctx) => IngredientService.addIngredient(input, ctx),
})

export const removeIngredient = mutationField("removeIngredient", {
  type: "Ingredient",
  args: { id: nonNull(intArg()) },
  resolve: async (_, { id }, ctx) =>
    IngredientService.removeIngredient(id, ctx),
})

export const updateIngredient = mutationField("updateIngredient", {
  type: "Ingredient",
  args: { input: nonNull(updateIngredientInput) },
  resolve: async (_, { input }, ctx) =>
    IngredientService.updateIngredient(input, ctx),
})

export const reorderIngredients = mutationField("reorderIngredients", {
  type: list("Ingredient"),
  args: { input: nonNull(reorderIngredientsInput) },
  resolve: async (_, { input }, ctx) =>
    IngredientService.reorderIngredients(input, ctx),
})

// TODO: move ingredients from plan to meal or vice versa
// moveIngredients

export const Ingredient = objectType({
  name: "Ingredient",
  definition(t) {
    t.nonNull.int("id")
    t.nonNull.float("amount")
    t.nonNull.string("measure")
    t.nonNull.int("order")

    t.nonNull.field("food", {
      type: nonNull("Food"),
      resolve: async ({ id }, _args, ctx) => {
        const food = await ctx.db.ingredient
          .findUnique({ where: { id } })
          .food()

        if (!food) {
          throw new NotFoundError("Food not found")
        }

        return food
      },
    })
  },
})
