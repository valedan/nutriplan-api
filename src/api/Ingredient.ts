import {
  objectType,
  nonNull,
  intArg,
  list,
  queryField,
  mutationField,
  inputObjectType,
  enumType,
} from "nexus"
import { sumBy, omitBy, isNil } from "lodash"
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

export const updateIngredient = mutationField("updateIngredient", {
  type: "Ingredient",
  args: { input: nonNull(updateIngredientInput) },
  resolve: async (_, { input: { id, ...updateData } }, ctx) => {
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

    return ctx.db.ingredient.update({
      where: { id },
      data: omitBy(updateData, isNil),
    })
  },
})

export const reorderIngredients = mutationField("reorderIngredients", {
  type: list("Ingredient"),
  args: { input: nonNull(reorderIngredientsInput) },
  resolve: async (_, { input }, ctx) => {
    const userId = ctx.auth.user.id
    let parent
    if (input.parentType === "plan") {
      parent = await ctx.db.plan.findFirst({
        where: { id: input.parentId, userId },
        include: { ingredients: true },
      })
    } else if (input.parentType === "recipe") {
      parent = await ctx.db.recipe.findFirst({
        where: { id: input.parentId, userId },
        include: { ingredients: true },
      })
    }

    if (!parent) {
      throw new NotFoundError("Could not find parent")
    }

    const currentSequence = parent.ingredients
      .sort(({ order }) => order)
      .map(({ id }) => id)

    const newSequence = [...currentSequence]
    input.reorders.forEach(({ id, newOrder }) => {
      if (!currentSequence.includes(id)) {
        throw new UserInputError("Invalid ingredient id")
      }

      const ingredientToMove = newSequence.splice(newSequence.indexOf(id), 1)[0]
      newSequence.splice(newOrder, 0, ingredientToMove)
    })

    const updatedIngredients = await Promise.all(
      newSequence.map((id, order) =>
        ctx.db.ingredient.update({
          where: { id },
          data: { order },
        })
      )
    )

    return updatedIngredients
  },
})

// move ingredients from plan to meal or vice versa
// moveIngredients
