import { GraphQLResponse } from "apollo-server-types"
import { gql } from "graphql-request"
import { subDays, addDays } from "date-fns"
import { Food, Ingredient, Plan, Portion, Recipe } from "@prisma/client"
import { NexusGenFieldTypes } from "../config/nexus-typegen"
import createTestServer from "../../tests/__helpers"
import {
  createFoods,
  createPortions,
  createPlan,
  createRecipe,
  createMeal,
  createIngredient,
} from "../../tests/factories"
import db from "../config/db"

jest.mock("../services/elastic/client")

const server = createTestServer({ userId: "ingredient_user" })

let foods: Food[] = []
let portions: Portion[] = []
let planWithIngredients: Plan
let planWithoutIngredients: Plan
let otherPlan: Plan
let recipe: Recipe
const planIngredients: Ingredient[] = []
let otherPlanIngredient: Ingredient

beforeAll(async () => {
  foods = await createFoods(3)
  portions = await createPortions(2, [
    { foodId: foods[0].id },
    { foodId: foods[0].id },
  ])
  planWithIngredients = await createPlan({
    userId: "ingredient_user",
    name: "Test Plan",
    startDate: subDays(new Date(), 3),
    endDate: addDays(new Date(), 3),
  })
  planWithoutIngredients = await createPlan({ userId: "ingredient_user" })
  otherPlan = await createPlan({ userId: "other_user" })
  recipe = await createRecipe({ userId: "ingredient_user" })

  planIngredients.push(
    await createIngredient({
      planId: planWithIngredients.id,
      foodId: foods[0].id,
    })
  )
  planIngredients.push(
    await createIngredient({
      planId: planWithIngredients.id,
      foodId: foods[1].id,
    })
  )
  otherPlanIngredient = await createIngredient({
    planId: otherPlan.id,
    foodId: foods[0].id,
  })
})

describe("Adding an ingredient", () => {
  const addIngredientMutation = gql`
    mutation addIngredient($input: AddIngredientInput!) {
      addIngredient(input: $input) {
        id
        amount
        measure
        order
      }
    }
  `

  type AddIngredientResponse = GraphQLResponse & {
    data?:
      | { addIngredient?: NexusGenFieldTypes["Ingredient"] }
      | null
      | undefined
  }

  it("Adds the ingredient to a plan without ingredients", async () => {
    const result: AddIngredientResponse = await server.executeOperation({
      query: addIngredientMutation,
      variables: {
        input: { planId: planWithoutIngredients.id, foodId: foods[0].id },
      },
    })

    expect(result.errors).toBeUndefined()
    expect(result.data?.addIngredient?.amount).toEqual(1)
    expect(result.data?.addIngredient?.measure).toEqual("g")
    expect(result.data?.addIngredient?.order).toEqual(0)
    expect(
      await db.plan
        .findUnique({ where: { id: planWithoutIngredients.id } })
        .ingredients()
    ).toHaveLength(1)
  })

  it("Adds the ingredient to a plan with ingredients", async () => {
    const result: AddIngredientResponse = await server.executeOperation({
      query: addIngredientMutation,
      variables: {
        input: { planId: planWithIngredients.id, foodId: foods[2].id },
      },
    })

    expect(result.errors).toBeUndefined()
    expect(result.data?.addIngredient?.order).toEqual(2)
    expect(
      await db.plan
        .findUnique({ where: { id: planWithIngredients.id } })
        .ingredients()
    ).toHaveLength(3)
  })

  it("Adds the ingredient to a recipe", async () => {
    const result: AddIngredientResponse = await server.executeOperation({
      query: addIngredientMutation,
      variables: {
        input: { recipeId: recipe.id, foodId: foods[0].id },
      },
    })

    expect(result.errors).toBeUndefined()
    expect(result.data?.addIngredient?.order).toEqual(0)
    expect(result.data?.addIngredient?.amount).toEqual(1)
    expect(result.data?.addIngredient?.measure).toEqual("g")
    expect(
      await db.recipe.findUnique({ where: { id: recipe.id } }).ingredients()
    ).toHaveLength(1)
  })

  it("returns an error when parent doesn't exist", async () => {
    const result: AddIngredientResponse = await server.executeOperation({
      query: addIngredientMutation,
      variables: {
        input: { planId: 342423, foodId: foods[2].id },
      },
    })

    expect(result.errors).toBeDefined()
    expect(result.data?.addIngredient).toBeNull()
  })

  it("returns an error when no parent provided", async () => {
    const result: AddIngredientResponse = await server.executeOperation({
      query: addIngredientMutation,
      variables: {
        input: { foodId: foods[2].id },
      },
    })

    expect(result.errors).toBeDefined()
    expect(result.data?.addIngredient).toBeNull()
  })

  it("returns an error when food doesn't exist", async () => {
    const result: AddIngredientResponse = await server.executeOperation({
      query: addIngredientMutation,
      variables: {
        input: { planId: planWithIngredients.id, foodId: 3452342 },
      },
    })

    expect(result.errors).toBeDefined()
    expect(result.data?.addIngredient).toBeNull()
  })

  it("returns an error when parent belongs to another user", async () => {
    const result: AddIngredientResponse = await server.executeOperation({
      query: addIngredientMutation,
      variables: {
        input: { planId: otherPlan.id, foodId: foods[2].id },
      },
    })

    expect(result.errors).toBeDefined()
    expect(result.data?.addIngredient).toBeNull()
    expect(
      await db.plan.findUnique({ where: { id: otherPlan.id } }).ingredients()
    ).toHaveLength(1)
  })

  // TODO once portions are more figured out
  // it("Uses the correct default serving size and measure", async () => {})
})

describe("Removing an ingredient", () => {
  let planForRemoval: Plan
  let recipeForRemoval: Recipe
  let recipeIngredient: Ingredient
  const ingredients: Ingredient[] = []

  beforeAll(async () => {
    planForRemoval = await createPlan({
      userId: "ingredient_user",
    })

    recipeForRemoval = await createRecipe({
      userId: "ingredient_user",
    })

    ingredients.push(
      await createIngredient({
        planId: planForRemoval.id,
        foodId: foods[0].id,
        order: 0,
      })
    )

    ingredients.push(
      await createIngredient({
        planId: planForRemoval.id,
        foodId: foods[1].id,
        order: 1,
      })
    )

    ingredients.push(
      await createIngredient({
        planId: planForRemoval.id,
        foodId: foods[2].id,
        order: 2,
      })
    )

    recipeIngredient = await createIngredient({
      recipeId: recipeForRemoval.id,
      foodId: foods[0].id,
      order: 0,
    })
  })

  const removeIngredientMutation = gql`
    mutation removeIngredient($id: Int!) {
      removeIngredient(id: $id) {
        id
        amount
        measure
        order
      }
    }
  `

  type RemoveIngredientResponse = GraphQLResponse & {
    data?:
      | { removeIngredient?: NexusGenFieldTypes["Ingredient"] }
      | null
      | undefined
  }

  it("Removes the first ingredient from a plan", async () => {
    const result: RemoveIngredientResponse = await server.executeOperation({
      query: removeIngredientMutation,
      variables: {
        id: ingredients[0].id,
      },
    })

    const remainingIngredients = await db.plan
      .findUnique({
        where: { id: planForRemoval.id },
      })
      .ingredients()

    expect(result.errors).toBeUndefined()
    expect(result.data?.removeIngredient?.id).toEqual(ingredients[0].id)
    expect(remainingIngredients).toHaveLength(2)
    expect(remainingIngredients.map((ing) => ing.order)).toEqual([0, 1])
  })

  it("Removes the last ingredient from a plan", async () => {
    const result: RemoveIngredientResponse = await server.executeOperation({
      query: removeIngredientMutation,
      variables: {
        id: ingredients[2].id,
      },
    })

    const remainingIngredients = await db.plan
      .findUnique({ where: { id: planForRemoval.id } })
      .ingredients()

    expect(result.errors).toBeUndefined()
    expect(remainingIngredients).toHaveLength(1)
    expect(remainingIngredients.map((ing) => ing.order)).toEqual([0])
  })

  it("Removes the ingredient from a recipe", async () => {
    const result: RemoveIngredientResponse = await server.executeOperation({
      query: removeIngredientMutation,
      variables: {
        id: recipeIngredient.id,
      },
    })

    const remainingIngredients = await db.recipe
      .findUnique({ where: { id: recipeForRemoval.id } })
      .ingredients()

    expect(result.errors).toBeUndefined()
    expect(remainingIngredients).toHaveLength(0)
  })

  it("returns an error when ingredient doesn't exist", async () => {
    const result: RemoveIngredientResponse = await server.executeOperation({
      query: removeIngredientMutation,
      variables: {
        id: 869987,
      },
    })

    expect(result.errors).toBeDefined()
    expect(result.data?.removeIngredient).toBeNull()
  })

  it("returns an error when ingredient belongs to another user", async () => {
    const result: RemoveIngredientResponse = await server.executeOperation({
      query: removeIngredientMutation,
      variables: {
        id: otherPlanIngredient.id,
      },
    })

    expect(result.errors).toBeDefined()
    expect(result.data?.removeIngredient).toBeNull()
  })
})

describe("Updating an ingredient", () => {
  const updateIngredientMutation = gql`
    mutation updateIngredient($input: UpdateIngredientInput!) {
      updateIngredient(input: $input) {
        id
        amount
        measure
        order
      }
    }
  `

  type UpdateIngredientResponse = GraphQLResponse & {
    data?:
      | { updateIngredient?: NexusGenFieldTypes["Ingredient"] }
      | null
      | undefined
  }

  it("Updates the ingredient", async () => {
    const result: UpdateIngredientResponse = await server.executeOperation({
      query: updateIngredientMutation,
      variables: {
        // TODO: check measure updating once portions are figured out
        input: { id: planIngredients[0].id, amount: 420 },
      },
    })

    expect(result.errors).toBeUndefined()
    expect(result.data?.updateIngredient?.amount).toEqual(420)

    const savedIngredient = await db.ingredient.findUnique({
      where: { id: planIngredients[0].id },
    })
    expect(savedIngredient?.amount).toEqual(420)
  })

  it("returns an error when ingredient doesn't exist", async () => {
    const result: UpdateIngredientResponse = await server.executeOperation({
      query: updateIngredientMutation,
      variables: {
        input: { id: 243223, amount: 123 },
      },
    })

    expect(result.errors).toBeDefined()
    expect(result.data?.updateIngredient).toBeNull()
  })

  it("returns an error when ingredient belongs to another user", async () => {
    const result: UpdateIngredientResponse = await server.executeOperation({
      query: updateIngredientMutation,
      variables: {
        input: { id: otherPlanIngredient.id, amount: 123 },
      },
    })

    expect(result.errors).toBeDefined()
    expect(result.data?.updateIngredient).toBeNull()
  })
})

describe("Reordering ingredients", () => {
  let planForReordering: Plan
  let recipeForReordering: Recipe
  let recipeIngredient: Ingredient
  const ingredients: Ingredient[] = []

  beforeAll(async () => {
    planForReordering = await createPlan({
      userId: "ingredient_user",
    })

    recipeForReordering = await createRecipe({
      userId: "ingredient_user",
    })

    recipeIngredient = await createIngredient({
      recipeId: recipeForReordering.id,
      foodId: foods[0].id,
      order: 0,
    })

    ingredients.push(
      await createIngredient({
        planId: planForReordering.id,
        foodId: foods[0].id,
        order: 0,
      })
    )

    ingredients.push(
      await createIngredient({
        planId: planForReordering.id,
        foodId: foods[1].id,
        order: 1,
      })
    )

    ingredients.push(
      await createIngredient({
        planId: planForReordering.id,
        foodId: foods[2].id,
        order: 2,
      })
    )
  })

  beforeEach(async () => {
    await db.ingredient.update({
      where: { id: ingredients[0].id },
      data: { order: 0 },
    })

    await db.ingredient.update({
      where: { id: ingredients[1].id },
      data: { order: 1 },
    })

    await db.ingredient.update({
      where: { id: ingredients[2].id },
      data: { order: 2 },
    })
  })

  const reorderIngredientsMutation = gql`
    mutation reorderIngredients($input: ReorderIngredientsInput!) {
      reorderIngredients(input: $input) {
        id
        order
        amount
      }
    }
  `

  type ReorderIngredientsResponse = GraphQLResponse & {
    data?:
      | { reorderIngredients?: NexusGenFieldTypes["Ingredient"][] }
      | null
      | undefined
  }

  it("Re-orders a single ingredient", async () => {
    const result: ReorderIngredientsResponse = await server.executeOperation({
      query: reorderIngredientsMutation,
      variables: {
        input: {
          parentType: "plan",
          parentId: planForReordering.id,
          reorders: [{ id: ingredients[0].id, newOrder: 2 }],
        },
      },
    })

    expect(result.errors).toBeUndefined()
    expect(
      result.data?.reorderIngredients?.map(({ id, order }) => ({ id, order }))
    ).toIncludeSameMembers([
      { id: ingredients[1].id, order: 0 },
      { id: ingredients[2].id, order: 1 },
      { id: ingredients[0].id, order: 2 },
    ])

    expect(
      (
        await db.plan
          .findUnique({ where: { id: planForReordering.id } })
          ?.ingredients()
      )?.map(({ id, order }) => ({ id, order }))
    ).toIncludeSameMembers([
      { id: ingredients[1].id, order: 0 },
      { id: ingredients[2].id, order: 1 },
      { id: ingredients[0].id, order: 2 },
    ])
  })

  it("Re-orders multiple ingredients", async () => {
    const result: ReorderIngredientsResponse = await server.executeOperation({
      query: reorderIngredientsMutation,
      variables: {
        input: {
          parentType: "plan",
          parentId: planForReordering.id,
          reorders: [
            { id: ingredients[2].id, newOrder: 0 },
            { id: ingredients[0].id, newOrder: 1 },
            { id: ingredients[1].id, newOrder: 2 },
          ],
        },
      },
    })

    expect(result.errors).toBeUndefined()
    expect(
      result.data?.reorderIngredients?.map(({ id, order }) => ({ id, order }))
    ).toIncludeSameMembers([
      { id: ingredients[2].id, order: 0 },
      { id: ingredients[0].id, order: 1 },
      { id: ingredients[1].id, order: 2 },
    ])

    expect(
      (
        await db.plan
          .findUnique({ where: { id: planForReordering.id } })
          ?.ingredients()
      )?.map(({ id, order }) => ({ id, order }))
    ).toIncludeSameMembers([
      { id: ingredients[2].id, order: 0 },
      { id: ingredients[0].id, order: 1 },
      { id: ingredients[1].id, order: 2 },
    ])
  })

  it("Preserves order contiguity", async () => {
    const result: ReorderIngredientsResponse = await server.executeOperation({
      query: reorderIngredientsMutation,
      variables: {
        input: {
          parentType: "plan",
          parentId: planForReordering.id,
          reorders: [{ id: ingredients[0].id, newOrder: 100 }],
        },
      },
    })

    expect(result.errors).toBeUndefined()
    expect(
      result.data?.reorderIngredients?.map(({ id, order }) => ({ id, order }))
    ).toIncludeSameMembers([
      { id: ingredients[1].id, order: 0 },
      { id: ingredients[2].id, order: 1 },
      { id: ingredients[0].id, order: 2 },
    ])

    expect(
      (
        await db.plan
          .findUnique({ where: { id: planForReordering.id } })
          ?.ingredients()
      )?.map(({ id, order }) => ({ id, order }))
    ).toIncludeSameMembers([
      { id: ingredients[1].id, order: 0 },
      { id: ingredients[2].id, order: 1 },
      { id: ingredients[0].id, order: 2 },
    ])
  })

  it("returns an error when plan belongs to another user", async () => {
    const result: ReorderIngredientsResponse = await server.executeOperation({
      query: reorderIngredientsMutation,
      variables: {
        input: {
          parentType: "plan",
          parentId: otherPlan.id,
          reorders: [{ id: otherPlanIngredient.id, newOrder: 1 }],
        },
      },
    })

    expect(result.errors).toBeDefined()
    expect(result.data?.reorderIngredients).toBeNull()
  })

  it("returns an error when ingredients belong to different parents", async () => {
    const result: ReorderIngredientsResponse = await server.executeOperation({
      query: reorderIngredientsMutation,
      variables: {
        input: {
          parentType: "plan",
          parentId: planForReordering.id,
          reorders: [
            { id: ingredients[0].id, newOrder: 1 },
            { id: recipeIngredient.id, newOrder: 2 },
          ],
        },
      },
    })

    expect(result.errors).toBeDefined()
    expect(result.data?.reorderIngredients).toBeNull()
  })
})

// TODO when meals implemented
// describe("Moving ingredients", () => {
//   it("Moves ingredients from a plan to a meal", async () => {})
//   it("Moves ingredients from a meal to a plan", async () => {})
//   it("returns an error when resource doesn't exist", async () => {})
//   it("returns an error when resource belongs to another user", async () => {})
//   it("returns an error when ingredients belong to different parents", async () => {})
// })
