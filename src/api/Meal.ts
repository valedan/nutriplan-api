// input will not include ings - create them from recipe
// addMeal

// also delete ings, and update order of other meals/ings
// removeMeal

// scalars only, excluding order
// updateMeal
import {
  nonNull,
  intArg,
  list,
  mutationField,
  inputObjectType,
  objectType,
} from "nexus"
import MealService from "../services/meal"

export const addMealInput = inputObjectType({
  name: "AddMealInput",
  definition(t) {
    t.nonNull.int("planId")
    t.nonNull.int("recipeId")
  },
})

export const updateMealInput = inputObjectType({
  name: "UpdateMealInput",
  definition(t) {
    t.nonNull.int("id")
    t.int("servings")
  },
})

// TODO Make this work together with ingredients
export const MealReorder = inputObjectType({
  name: "MealReorder",
  definition(t) {
    t.nonNull.int("id")
    t.nonNull.int("newOrder")
  },
})

export const reorderMealsInput = inputObjectType({
  name: "ReorderMealsInput",
  definition(t) {
    t.nonNull.int("parentId")
    t.nonNull.list.field("reorders", { type: nonNull("MealReorder") })
  },
})

export const addMeal = mutationField("addMeal", {
  type: "Meal",
  args: { input: nonNull(addMealInput) },
  resolve: (_, { input }, ctx) => MealService.addMeal(input, ctx),
})

export const removeMeal = mutationField("removeMeal", {
  type: "Meal",
  args: { id: nonNull(intArg()) },
  resolve: async (_, { id }, ctx) => MealService.removeMeal(id, ctx),
})

export const updateMeal = mutationField("updateMeal", {
  type: "Meal",
  args: { input: nonNull(updateMealInput) },
  resolve: async (_, { input }, ctx) => MealService.updateMeal(input, ctx),
})

// TODO
// export const reorderMeals = mutationField("reorderMeals", {
//   type: list("Meal"),
//   args: { input: nonNull(reorderMealsInput) },
//   resolve: async (_, { input }, ctx) => MealService.reorderMeals(input, ctx),
// })

// TODO: Ungroup meal

export const Meal = objectType({
  name: "Meal",
  definition(t) {
    t.nonNull.int("id")
    t.nonNull.int("servings")
    t.nonNull.int("order")

    t.field("ingredients", {
      type: nonNull(list(nonNull("Ingredient"))),
      resolve: ({ id }, _args, ctx) =>
        ctx.db.meal.findUnique({ where: { id } }).ingredients(),
    })

    t.field("recipe", {
      type: "Recipe",
      resolve: ({ id }, _args, ctx) =>
        ctx.db.meal.findUnique({ where: { id } }).recipe(),
    })

    t.field("plan", {
      type: "Plan",
      resolve: ({ id }, _args, ctx) =>
        ctx.db.meal.findUnique({ where: { id } }).plan(),
    })
  },
})
