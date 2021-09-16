/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GraphQLResponse } from "apollo-server-types"
import { gql } from "graphql-request"
import { Food, Plan, Portion, Recipe } from "@prisma/client"
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

jest.mock("../services/elastic/client")

const server = createTestServer()

const getPlanQuery = gql`
  query getFood($id: Int!) {
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

let foods: Food[] = []
let portions: Portion[] = []
let plan: Plan
let recipe: Recipe

beforeAll(async () => {
  foods = await createFoods(2)
  portions = await createPortions(2, [
    { foodId: foods[0].id },
    { foodId: foods[0].id },
  ])
  plan = await createPlan()
  recipe = await createRecipe()

  const meal = await createMeal({ planId: plan.id, recipeId: recipe.id })
  await createIngredient({ mealId: meal.id, foodId: foods[0].id })
  await createIngredient({ planId: plan.id, foodId: foods[1].id })
})

type GraphQLIngredient = NexusGenFieldTypes["Ingredient"] & {
  food: NexusGenFieldTypes["Food"]
}

describe("Querying a single plan", () => {
  it("returns the requested plan", async () => {
    // Nexus is only generating types 1 level deep, it's not properly handling the query nesting
    // https://github.com/graphql-nexus/nexus/issues/839
    const result: GraphQLResponse & {
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
    } = await server.executeOperation({
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
    ).toIncludeSameMembers(portions.map(({ gramWeight }) => gramWeight))

    expect(result.data?.plan?.meals[0].recipe.name).toEqual(recipe.name)
    expect(result.data?.plan?.ingredients?.[0].food.id).toEqual(foods[1].id)
  })

  it("returns null if plan is not found", async () => {
    const result: GraphQLResponse & {
      data?: { plan?: NexusGenFieldTypes["Plan"] } | null | undefined
    } = await server.executeOperation({
      query: getPlanQuery,
      variables: { id: 432423 },
    })

    expect(result.errors).toBeUndefined()
    expect(result.data?.plan).toBeNull()
  })
})
