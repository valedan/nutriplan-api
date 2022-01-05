/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

const server = createTestServer({ userId: "plan_user" })

type GraphQLIngredient = NexusGenFieldTypes["Ingredient"] & {
  food: NexusGenFieldTypes["Food"]
}

let foods: Food[] = []
let portions: Portion[] = []
let plan: Plan
let plan2: Plan
let otherPlan: Plan
let recipe: Recipe
let planIngredient: Ingredient

beforeAll(async () => {
  foods = await createFoods(2)
  portions = await createPortions(2, [
    { foodId: foods[0].id },
    { foodId: foods[0].id },
  ])
  plan = await createPlan({
    userId: "plan_user",
    name: "Test Plan",
    startDate: subDays(new Date(), 3),
    endDate: addDays(new Date(), 3),
  })
  plan2 = await createPlan({ userId: "plan_user" })
  otherPlan = await createPlan({ userId: "other_user" })
  recipe = await createRecipe()

  const meal = await createMeal({ planId: plan.id, recipeId: recipe.id })
  planIngredient = await createIngredient({
    mealId: meal.id,
    foodId: foods[0].id,
  })
  await createIngredient({ planId: plan.id, foodId: foods[1].id })
})

describe("Querying a single plan", () => {
  const getPlanQuery = gql`
    query getPlan($id: Int!) {
      plan(id: $id) {
        id
        name
        meals {
          id
          recipe {
            name
          }
          ingredients {
            id
            food {
              id
              portions {
                gramWeight
              }
            }
          }
        }
        ingredients {
          id
          food {
            id
            portions {
              gramWeight
            }
          }
        }
      }
    }
  `

  type GetPlanResponse = GraphQLResponse & {
    data?:
      | {
          plan?: NexusGenFieldTypes["Plan"] & {
            ingredients: GraphQLIngredient[]
            meals: NexusGenFieldTypes["Meal"] &
              {
                ingredients: GraphQLIngredient[]
                recipe: NexusGenFieldTypes["Recipe"]
              }[]
          }
        }
      | null
      | undefined
  }

  it("returns the requested plan", async () => {
    // Nexus is only generating types 1 level deep, it's not properly handling the query nesting
    // https://github.com/graphql-nexus/nexus/issues/839
    const result: GetPlanResponse = await server.executeOperation({
      query: getPlanQuery,
      variables: { id: plan.id },
    })

    expect(result.errors).toBeUndefined()

    expect(result.data?.plan?.id).toEqual(plan.id)

    expect(result.data?.plan?.meals?.[0].ingredients?.[0].food.id).toEqual(
      foods[0].id
    )
    expect(
      result.data?.plan?.meals?.[0].ingredients[0].food.portions.map(
        ({ gramWeight }) => gramWeight
      )
    ).toIncludeAllMembers(portions.map(({ gramWeight }) => gramWeight))

    expect(result.data?.plan?.meals[0].recipe.name).toEqual(recipe.name)
    expect(result.data?.plan?.ingredients?.[0].food.id).toEqual(foods[1].id)
  })

  it("returns an error if plan is not found", async () => {
    const result: GetPlanResponse = await server.executeOperation({
      query: getPlanQuery,
      variables: { id: 432423 },
    })

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toMatchInlineSnapshot(`"Plan not found"`)
  })

  it("returns an error if plan belongs to another user", async () => {
    const result: GetPlanResponse = await server.executeOperation({
      query: getPlanQuery,
      variables: { id: otherPlan.id },
    })

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toMatchInlineSnapshot(`"Plan not found"`)
  })
})

describe("Querying multiple plans", () => {
  const getPlansQuery = gql`
    query getPlans {
      plans {
        id
        name
        startDate
        endDate
      }
    }
  `

  type GetPlansResponse = GraphQLResponse & {
    data?: { plans?: NexusGenFieldTypes["Plan"][] } | null | undefined
  }

  it("returns all plans belonging to the user", async () => {
    const result: GetPlansResponse = await server.executeOperation({
      query: getPlansQuery,
    })

    expect(result.errors).toBeUndefined()
    expect(result.data?.plans?.map(({ id }) => id)).toIncludeSameMembers([
      plan.id,
      plan2.id,
    ])
  })
})

describe("Creating a new plan", () => {
  const createPlanMutation = gql`
    mutation createPlan($input: CreatePlanInput!) {
      createPlan(input: $input) {
        id
        name
        startDate
        endDate
      }
    }
  `

  type CreatePlanResponse = GraphQLResponse & {
    data?: { createPlan?: NexusGenFieldTypes["Plan"] } | null | undefined
  }

  it("creates a plan", async () => {
    const dateTime = new Date()
    const result: CreatePlanResponse = await server.executeOperation({
      query: createPlanMutation,
      variables: {
        input: { name: "Test Plan", startDate: dateTime, endDate: dateTime },
      },
    })

    expect(result.errors).toBeUndefined()
    expect(result.data?.createPlan?.name).toEqual("Test Plan")
    expect(result.data?.createPlan?.startDate).toEqual(dateTime)
    expect(
      await db.plan.findUnique({ where: { id: result.data?.createPlan?.id } })
    ).toBeDefined()
  })

  it("returns error if required fields are missing", async () => {
    const result: CreatePlanResponse = await server.executeOperation({
      query: createPlanMutation,
      variables: {},
    })

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toMatchInlineSnapshot(
      `"Variable \\"$input\\" of required type \\"CreatePlanInput!\\" was not provided."`
    )
  })
})

describe("Updating a plan", () => {
  const updatePlanMutation = gql`
    mutation updatePlan($input: UpdatePlanInput!) {
      updatePlan(input: $input) {
        id
        name
        startDate
        endDate
      }
    }
  `

  type UpdatePlanResponse = GraphQLResponse & {
    data?: { updatePlan?: NexusGenFieldTypes["Plan"] } | null | undefined
  }

  it("updates the plan", async () => {
    const result: UpdatePlanResponse = await server.executeOperation({
      query: updatePlanMutation,
      variables: {
        input: {
          id: plan.id,
          name: "Updated Plan",
        },
      },
    })

    expect(result.errors).toBeUndefined()
    expect(result.data?.updatePlan?.name).toEqual("Updated Plan")
    expect(
      (await db.plan.findUnique({ where: { id: result.data?.updatePlan?.id } }))
        ?.name
    ).toEqual("Updated Plan")
  })

  it("does not require all fields to be specified", async () => {
    const newDate = new Date()
    const result: UpdatePlanResponse = await server.executeOperation({
      query: updatePlanMutation,
      variables: {
        input: {
          id: plan.id,
          startDate: newDate,
        },
      },
    })

    expect(result.errors).toBeUndefined()
    expect(result.data?.updatePlan?.startDate).toEqual(newDate)
  })

  it("returns null if plan is not found", async () => {
    const result: UpdatePlanResponse = await server.executeOperation({
      query: updatePlanMutation,
      variables: {
        input: {
          id: 134231,
          name: "Updated Plan",
        },
      },
    })
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toMatchInlineSnapshot(`"Plan not found"`)
  })

  it("returns null if plan belongs to another user", async () => {
    const result: UpdatePlanResponse = await server.executeOperation({
      query: updatePlanMutation,
      variables: {
        input: {
          id: otherPlan.id,
          name: "Updated Plan",
        },
      },
    })
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toMatchInlineSnapshot(`"Plan not found"`)
  })
})

describe("Deleting a plan", () => {
  const deletePlanMutation = gql`
    mutation updatePlan($id: Int!) {
      deletePlan(id: $id) {
        id
      }
    }
  `

  type DeletePlanResponse = GraphQLResponse & {
    data?: { deletePlan?: { id: number } } | null | undefined
  }

  it("deletes the plan", async () => {
    const result: DeletePlanResponse = await server.executeOperation({
      query: deletePlanMutation,
      variables: {
        id: plan.id,
      },
    })

    expect(result.errors).toBeUndefined()
    expect(result.data?.deletePlan?.id).toEqual(plan.id)
    expect(await db.plan.findUnique({ where: { id: plan.id } })).toBeNull()
    expect(
      await db.ingredient.findUnique({ where: { id: planIngredient.id } })
    ).toBeNull()
  })

  it("returns null if plan is not found", async () => {
    const result: DeletePlanResponse = await server.executeOperation({
      query: deletePlanMutation,
      variables: {
        id: 124252,
      },
    })

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toMatchInlineSnapshot(`"Plan not found"`)
  })

  it("returns null if plan belongs to another user", async () => {
    const result: DeletePlanResponse = await server.executeOperation({
      query: deletePlanMutation,
      variables: {
        id: otherPlan.id,
      },
    })

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toMatchInlineSnapshot(`"Plan not found"`)
  })
})
