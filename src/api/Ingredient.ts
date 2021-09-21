import {
  objectType,
  nonNull,
  intArg,
  list,
  queryField,
  mutationField,
  inputObjectType,
} from "nexus"
import { sumBy } from "lodash"
import { UserInputError } from "apollo-server"
import { NotFoundError } from "./shared/errors"

export const addIngredientInput = inputObjectType({
  name: "AddIngredientInput",
  definition(t) {
    t.nonNull.int("foodId")
    t.int("planId")
    t.int("recipeId")
  },
})

export const addIngredient = mutationField("addIngredient", {
  type: "Ingredient",
  args: { input: nonNull(addIngredientInput) },
  resolve: async (_, { input }, ctx) => {
    let parent
    if (
      sumBy([input.planId, input.recipeId], (parentId) =>
        parentId ? 1 : 0
      ) !== 1
    ) {
      throw new UserInputError("You must specify one parent")
    }

    if (input.planId) {
      parent = await ctx.db.plan.findFirst({
        where: { id: input.planId, userId: ctx.auth.user.id },
        include: { _count: { select: { ingredients: true } } },
      })
    } else if (input.recipeId) {
      parent = await ctx.db.recipe.findFirst({
        where: { id: input.recipeId, userId: ctx.auth.user.id },
        include: { _count: { select: { ingredients: true } } },
      })
    }

    if (!parent) {
      throw new NotFoundError("Could not find parent")
    }

    const ingredient = await ctx.db.ingredient.create({
      data: {
        foodId: input.foodId,
        planId: input.planId,
        recipeId: input.recipeId,
        amount: 1,
        measure: "g",
        order: parent._count?.ingredients || 0,
      },
    })
    return ingredient
  },
})

export const removeIngredient = mutationField("removeIngredient", {
  type: "Ingredient",
  args: { id: nonNull(intArg()) },
  resolve: async (_, { id }, ctx) => {
    const userId = ctx.auth.user.id
    const ingredient = await ctx.db.ingredient.findFirst({
      where: { id },
      include: { plan: true, recipe: true },
    })

    if (
      !ingredient ||
      (ingredient.plan && ingredient.plan.userId !== userId) ||
      (ingredient.recipe && ingredient.recipe.userId !== userId)
    ) {
      throw new NotFoundError("Could not find ingredient")
    }

    await ctx.db.ingredient.delete({ where: { id } })

    const higherIngredients = await ctx.db.ingredient.findMany({
      where: {
        planId: ingredient.planId,
        recipeId: ingredient.recipeId,
        order: {
          gt: ingredient.order,
        },
      },
    })
    for await (const higherIngredient of higherIngredients) {
      await ctx.db.ingredient.update({
        where: { id: higherIngredient.id },
        data: {
          order: higherIngredient.order - 1,
        },
      })
    }

    return ingredient
  },
})

// does not include order
// updateIngredient

// can handle many ingredients as long as they have the same parent. may include meals if parent is plan
// reorderIngredients

// move ingredients from plan to meal or vice versa
// moveIngredients
