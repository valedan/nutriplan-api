/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GraphQLResponse } from "apollo-server-types"
import { gql } from "graphql-request"
import { mocked } from "ts-jest/utils"
import { Food, Nutrient, FoodNutrient, Portion } from "@prisma/client"
import { NexusGenFieldTypes } from "../config/nexus-typegen"
import ElasticClient from "../services/food/searchFoods/client"
import createTestServer from "../../tests/__helpers"
import {
  createFood,
  createFoodNutrient,
  createFoods,
  createNutrients,
  createPortion,
  createPortions,
} from "../../tests/factories"

jest.mock("../services/food/searchFoods/client")
const mockedElastic = mocked(ElasticClient, true)

const server = createTestServer({ userId: "food_user" })

const getFoodQuery = gql`
  query getFood($id: Int!, $nutrientIds: [Int!]) {
    food(id: $id) {
      id
      description
      foodNutrients(nutrientIds: $nutrientIds) {
        amount
        nutrient {
          id
        }
      }
      portions {
        measure
        gramWeight
      }
    }
  }
`

const getFoodsQuery = gql`
  query getFoods($ids: [Int!]!, $nutrientIds: [Int!]) {
    foods(ids: $ids) {
      id
      description
      foodNutrients(nutrientIds: $nutrientIds) {
        amount
        nutrient {
          id
        }
      }
      portions {
        gramWeight
      }
    }
  }
`

const searchFoodsQuery = gql`
  query ($searchTerm: String!, $nutrientIds: [Int!]) {
    searchFoods(searchTerm: $searchTerm) {
      id
      description
      foodNutrients(nutrientIds: $nutrientIds) {
        amount
        nutrient {
          id
        }
      }
      portions {
        gramWeight
      }
    }
  }
`

let foods: Food[] = []
let nutrients: Nutrient[] = []
// eslint-disable-next-line prefer-const
let foodNutrients: FoodNutrient[] = []
let portions: Portion[] = []

beforeAll(async () => {
  foods = await createFoods(2)
  nutrients = await createNutrients(2)

  foods.push(
    await createFood({
      description: "branded food",
      servingSize: 10,
      servingSizeUnit: "g",
    })
  )

  await createPortion({
    foodId: foods[2].id,
    measureUnit: "tbsp",
  })

  foodNutrients.push(
    await createFoodNutrient({
      foodId: foods[0].id,
      nutrientId: nutrients[0].id,
    })
  )

  foodNutrients.push(
    await createFoodNutrient({
      foodId: foods[0].id,
      nutrientId: nutrients[1].id,
    })
  )

  portions = await createPortions(2, [
    { foodId: foods[0].id },
    { foodId: foods[0].id },
  ])
})

// TODO: test case of passing no nutrient ids and check that correct defaults are returned
describe("Querying a single food", () => {
  it("returns the requested food", async () => {
    const result: GraphQLResponse & {
      data?:
        | {
            food?: Omit<NexusGenFieldTypes["Food"], "foodNutrients"> & {
              foodNutrients: NexusGenFieldTypes["FoodNutrient"][]
            }
          }
        | null
        | undefined
    } = await server.executeOperation({
      query: getFoodQuery,
      variables: {
        id: foods[0].id,
        nutrientIds: [nutrients[0].id, nutrients[1].id],
      },
    })

    expect(result.errors).toBeUndefined()

    expect(result.data?.food?.id).toEqual(foods[0].id)

    expect(
      result.data?.food?.foodNutrients.map(({ nutrient }) => nutrient.id)
    ).toIncludeSameMembers(nutrients.map(({ id }) => id))

    expect(
      result.data?.food?.foodNutrients.map(({ amount }) => amount)
    ).toIncludeSameMembers(foodNutrients.map(({ amount }) => amount))

    expect(
      result.data?.food?.portions.map(({ gramWeight }) => gramWeight)
    ).toIncludeAllMembers(portions.map(({ gramWeight }) => gramWeight))
  })

  it("includes all available portions", async () => {
    const result: GraphQLResponse & {
      data?:
        | {
            food?: Omit<NexusGenFieldTypes["Food"], "foodNutrients"> & {
              foodNutrients: NexusGenFieldTypes["FoodNutrient"][]
            }
          }
        | null
        | undefined
    } = await server.executeOperation({
      query: getFoodQuery,
      variables: { id: foods[2].id },
    })

    expect(result.errors).toBeUndefined()

    const portionMeasures = result.data?.food?.portions.map(
      ({ measure }) => measure
    )

    expect(portionMeasures).toInclude("g")
    expect(portionMeasures).toInclude("oz")
    expect(portionMeasures).toInclude("fl oz")
    expect(portionMeasures).toInclude("cup")
    expect(portionMeasures).toInclude("tablespoon")
    expect(portionMeasures).toInclude("teaspoon")
    expect(portionMeasures).toInclude("serving")
  })

  it("returns an error if food is not found", async () => {
    const result: GraphQLResponse & {
      data?:
        | {
            food?: Omit<NexusGenFieldTypes["Food"], "foodNutrients"> & {
              foodNutrients: NexusGenFieldTypes["FoodNutrient"][]
            }
          }
        | null
        | undefined
    } = await server.executeOperation({
      query: getFoodQuery,
      variables: { id: 432423 },
    })

    expect(result.errors).toBeDefined()
    expect(result.data?.food).toBeNull()
  })
})

describe("Querying multiple foods", () => {
  it("returns the requested foods", async () => {
    const result: GraphQLResponse & {
      data?:
        | {
            foods?: (Omit<NexusGenFieldTypes["Food"], "foodNutrients"> & {
              foodNutrients: NexusGenFieldTypes["FoodNutrient"][]
            })[]
          }
        | null
        | undefined
    } = await server.executeOperation({
      query: getFoodsQuery,
      variables: {
        ids: [foods[0].id, foods[1].id, 423423],
        nutrientIds: [nutrients[0].id, nutrients[1].id],
      },
    })

    expect(result.errors).toBeUndefined()
    expect(result.data?.foods).toHaveLength(2)

    expect(result.data?.foods?.map(({ id }) => id)).toIncludeSameMembers([
      foods[0].id,
      foods[1].id,
    ])
    expect(
      result.data?.foods
        ?.find(({ id }) => id === foods[0].id)
        ?.foodNutrients.map(({ nutrient }) => nutrient.id)
    ).toIncludeSameMembers(nutrients.map(({ id }) => id))
  })
})

describe("Searching for foods", () => {
  it("returns foods matching the search term", async () => {
    mockedElastic.search.mockResolvedValue({
      results: [
        { id: { raw: foods[0].id.toString() }, _meta: { score: 0 } },
        { id: { raw: foods[1].id.toString() }, _meta: { score: 0 } },
      ],
    })

    const result: GraphQLResponse & {
      data?:
        | {
            searchFoods?: (Omit<NexusGenFieldTypes["Food"], "foodNutrients"> & {
              foodNutrients: NexusGenFieldTypes["FoodNutrient"][]
            })[]
          }
        | null
        | undefined
    } = await server.executeOperation({
      query: searchFoodsQuery,
      variables: {
        searchTerm: "test",
        nutrientIds: [nutrients[0].id, nutrients[1].id],
      },
    })

    expect(result.errors).toBeUndefined()
    expect(result.data?.searchFoods).toHaveLength(2)

    expect(result.data?.searchFoods?.map(({ id }) => id)).toIncludeSameMembers([
      foods[0].id,
      foods[1].id,
    ])
    expect(
      result.data?.searchFoods
        ?.find(({ id }) => id === foods[0].id)
        ?.foodNutrients.map(({ nutrient }) => nutrient.id)
    ).toIncludeSameMembers(nutrients.map(({ id }) => id))
  })
})
