/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GraphQLResponse } from "apollo-server-types"
import { gql } from "graphql-request"
import { Food, Plan, Recipe } from "@prisma/client"
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

const server = createTestServer({ userId: "recipe_user" })

const getRecipeQuery = gql`
  query getFood($id: Int!) {
    recipe(id: $id) {
      id
      name
      meals {
        id
        plan {
          id
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
let plan: Plan
let recipe: Recipe

beforeAll(async () => {
  foods = await createFoods(2)
  await createPortions(2, [{ foodId: foods[0].id }, { foodId: foods[0].id }])
  plan = await createPlan({ userId: "recipe_user" })
  recipe = await createRecipe({ userId: "recipe_user" })

  const meal = await createMeal({ planId: plan.id, recipeId: recipe.id })
  await createIngredient({ mealId: meal.id, foodId: foods[0].id })
  await createIngredient({ recipeId: recipe.id, foodId: foods[1].id })
})

type GraphQLIngredient = NexusGenFieldTypes["Ingredient"] & {
  food: NexusGenFieldTypes["Food"]
}

describe("Querying a single recipe", () => {
  it("returns the requested recipe", async () => {
    // Nexus is only generating types 1 level deep, it's not properly handling the query nesting
    // https://github.com/graphql-nexus/nexus/issues/839
    const result: GraphQLResponse & {
      data?:
        | {
            recipe?: NexusGenFieldTypes["Recipe"] & {
              ingredients: GraphQLIngredient[]
              meals: NexusGenFieldTypes["Meal"] &
                {
                  ingredients: GraphQLIngredient[]
                  plan: NexusGenFieldTypes["Plan"]
                }[]
            }
          }
        | null
        | undefined
    } = await server.executeOperation({
      query: getRecipeQuery,
      variables: { id: recipe.id },
    })

    expect(result.errors).toBeUndefined()

    expect(result.data?.recipe?.id).toEqual(recipe.id)
    expect(result.data?.recipe?.meals[0].plan.id).toEqual(plan.id)
    expect(result.data?.recipe?.ingredients?.[0].food.id).toEqual(foods[1].id)
  })

  it("returns null if recipe is not found", async () => {
    const result: GraphQLResponse & {
      data?: { recipe?: NexusGenFieldTypes["Recipe"] } | null | undefined
    } = await server.executeOperation({
      query: getRecipeQuery,
      variables: { id: 432423 },
    })

    expect(result.errors && result.errors[0].message).toInclude(
      "Recipe not found"
    )
    expect(result.data?.recipe).toBeNull()
  })
})

// TODO
describe("Querying multiple recipes", () => {})
