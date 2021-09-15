/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GraphQLResponse } from "apollo-server-types"
import { gql } from "graphql-request"
import { mocked } from "ts-jest/utils"
import { Food, Nutrient, FoodNutrient, Portion } from "@prisma/client"
import { NexusGenFieldTypes } from "../config/nexus-typegen"
import ElasticClient from "../services/elastic/client"
import createTestServer from "../../tests/__helpers"
import {
  createFoodNutrient,
  createFoods,
  createNutrients,
  createPortions,
} from "../../tests/factories"

jest.mock("../services/elastic/client")
const mockedElastic = mocked(ElasticClient, true)

const server = createTestServer()

const getFoodQuery = gql`
  query getFood($id: Int!) {
    food(id: $id) {
      id
      description
      nutrients {
        id
        amount
      }
      portions {
        gramWeight
      }
    }
  }
`

const getFoodsQuery = gql`
  query getFoods($ids: [Int!]!) {
    foods(ids: $ids) {
      id
      description
      nutrients {
        id
        amount
      }
      portions {
        gramWeight
      }
    }
  }
`

const searchFoodsQuery = gql`
  query ($searchTerm: String!) {
    searchFoods(searchTerm: $searchTerm) {
      id
      description
      nutrients {
        id
        amount
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

describe("Querying a single food", () => {
  it("returns the requested food", async () => {
    const result: GraphQLResponse & {
      data?: { food?: NexusGenFieldTypes["Food"] } | null | undefined
    } = await server.executeOperation({
      query: getFoodQuery,
      variables: { id: foods[0].id },
    })

    expect(result.errors).toBeUndefined()

    expect(result.data?.food?.id).toEqual(foods[0].id)

    expect(
      result.data?.food?.nutrients.map(({ id }) => id)
    ).toIncludeSameMembers(nutrients.map(({ id }) => id))

    expect(
      result.data?.food?.nutrients.map(({ amount }) => amount)
    ).toIncludeSameMembers(foodNutrients.map(({ amount }) => amount))

    expect(
      result.data?.food?.portions.map(({ gramWeight }) => gramWeight)
    ).toIncludeSameMembers(portions.map(({ gramWeight }) => gramWeight))
  })

  it("returns null if food is not found", async () => {
    const result: GraphQLResponse & {
      data?: { food?: NexusGenFieldTypes["Food"] } | null | undefined
    } = await server.executeOperation({
      query: getFoodQuery,
      variables: { id: 432423 },
    })

    expect(result.errors).toBeUndefined()
    expect(result.data?.food).toBeNull()
  })
})

describe("Querying multiple foods", () => {
  it("returns the requested foods", async () => {
    const result: GraphQLResponse & {
      data?: { foods?: NexusGenFieldTypes["Food"][] } | null | undefined
    } = await server.executeOperation({
      query: getFoodsQuery,
      variables: { ids: [foods[0].id, foods[1].id, 423423] },
    })

    expect(result.errors).toBeUndefined()
    expect(result.data?.foods).toHaveLength(2)

    expect(result.data?.foods?.map(({ id }) => id)).toIncludeSameMembers(
      foods.map(({ id }) => id)
    )
    expect(
      result.data?.foods
        ?.find(({ id }) => id === foods[0].id)
        ?.nutrients.map(({ id }) => id)
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
      data?: { searchFoods?: NexusGenFieldTypes["Food"][] } | null | undefined
    } = await server.executeOperation({
      query: searchFoodsQuery,
      variables: { searchTerm: "test" },
    })

    console.log(result)

    expect(result.errors).toBeUndefined()
    expect(result.data?.searchFoods).toHaveLength(2)

    expect(result.data?.searchFoods?.map(({ id }) => id)).toIncludeSameMembers(
      foods.map(({ id }) => id)
    )
    expect(
      result.data?.searchFoods
        ?.find(({ id }) => id === foods[0].id)
        ?.nutrients.map(({ id }) => id)
    ).toIncludeSameMembers(nutrients.map(({ id }) => id))
  })
})
