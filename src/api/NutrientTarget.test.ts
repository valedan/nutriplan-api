// Query active profile
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GraphQLResponse } from "apollo-server-types"
import { gql } from "graphql-request"
import { NutrientProfile, NutrientTarget } from "@prisma/client"
import { NexusGenFieldTypes } from "../config/nexus-typegen"
import createTestServer from "../../tests/__helpers"
import {
  createNutrient,
  createNutrientProfile,
  createNutrientTarget,
} from "../../tests/factories"

const server = createTestServer({ userId: "current_user" })

let currentUserActiveProfile: NutrientProfile
let nutrientTarget: NutrientTarget
let otherProfile: NutrientProfile
let otherTarget: NutrientTarget

beforeAll(async () => {
  const nutrient = await createNutrient({ name: "carbs" })

  currentUserActiveProfile = await createNutrientProfile({
    userId: "current_user",
    isActive: true,
  })

  nutrientTarget = await createNutrientTarget({
    nutrientId: nutrient.id,
    nutrientProfileId: currentUserActiveProfile.id,
    min: 42,
    max: 100,
  })

  otherProfile = await createNutrientProfile({
    userId: "other_user",
    isActive: true,
  })

  otherTarget = await createNutrientTarget({
    nutrientId: nutrient.id,
    nutrientProfileId: otherProfile.id,
    min: 1,
    max: 2,
  })
})

describe("Updating a target", () => {
  const updateTargetMutation = gql`
    mutation updateTarget($input: UpdateTargetInput!) {
      updateTarget(input: $input) {
        id
        min
        max
        nutrient {
          id
          name
        }
      }
    }
  `

  // Nexus is only generating types 1 level deep, it's not properly handling the query nesting
  // https://github.com/graphql-nexus/nexus/issues/839
  type UpdateTargetResponse = GraphQLResponse & {
    data?:
      | {
          updateTarget?: NexusGenFieldTypes["NutrientTarget"] & {
            nutrient: NexusGenFieldTypes["Nutrient"]
          }
        }
      | null
      | undefined
  }

  it("updates the target", async () => {
    const result: UpdateTargetResponse = await server.executeOperation({
      query: updateTargetMutation,
      variables: {
        input: { id: nutrientTarget.id, min: 20 },
      },
    })

    expect(result.errors).toBeUndefined()
    expect(result.data?.updateTarget?.min).toEqual(20)
    expect(result.data?.updateTarget?.max).toEqual(100)
    expect(result.data?.updateTarget?.nutrient?.name).toEqual("carbs")

    const otherResult: UpdateTargetResponse = await server.executeOperation({
      query: updateTargetMutation,
      variables: {
        input: {
          id: nutrientTarget.id,
          min: 40,
          max: null,
        },
      },
    })

    expect(otherResult.errors).toBeUndefined()
    expect(otherResult.data?.updateTarget?.min).toEqual(40)
    expect(otherResult.data?.updateTarget?.max).toBeNull()
  })

  it("returns an error if the target does not exist", async () => {
    const result: UpdateTargetResponse = await server.executeOperation({
      query: updateTargetMutation,
      variables: {
        input: { id: 100000, min: 20 },
      },
    })

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toMatchInlineSnapshot(
      `"Target not found"`
    )
  })

  it("returns an error if the target belongs to another user", async () => {
    const result: UpdateTargetResponse = await server.executeOperation({
      query: updateTargetMutation,
      variables: {
        input: { id: otherTarget.id, min: 20 },
      },
    })

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toMatchInlineSnapshot(
      `"Target not found"`
    )
  })
})
