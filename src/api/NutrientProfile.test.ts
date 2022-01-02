// Query active profile
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GraphQLResponse } from "apollo-server-types"
import { gql } from "graphql-request"
import { NutrientProfile } from "@prisma/client"
import { NexusGenFieldTypes } from "../config/nexus-typegen"
import createTestServer from "../../tests/__helpers"
import {
  createNutrient,
  createNutrientProfile,
  createNutrientTarget,
} from "../../tests/factories"
import db from "../config/db"

const server = createTestServer({ userId: "current_user" })
const newUserContext = createTestServer({ userId: "new_user" })

let currentUserActiveProfile: NutrientProfile

beforeAll(async () => {
  currentUserActiveProfile = await createNutrientProfile({
    userId: "current_user",
    isActive: true,
  })

  await createNutrientProfile({
    userId: "current_user",
    isActive: false,
  })

  await createNutrientProfile({
    userId: "other_user",
    isActive: true,
  })

  const nutrient = await createNutrient({ name: "carbs" })
  await createNutrientTarget({
    nutrientId: nutrient.id,
    nutrientProfileId: currentUserActiveProfile.id,
    min: 42,
    max: 100,
  })
})

describe("Querying user's profile", () => {
  const getActiveProfileQuery = gql`
    query getActiveProfile {
      activeNutrientProfile {
        id
        name
        isActive
        nutrientTargets {
          id
          min
          max
          nutrient {
            id
            name
          }
        }
      }
    }
  `

  // Nexus is only generating types 1 level deep, it's not properly handling the query nesting
  // https://github.com/graphql-nexus/nexus/issues/839
  type GetActiveProfileResponse = GraphQLResponse & {
    data?:
      | {
          activeNutrientProfile?: NexusGenFieldTypes["NutrientProfile"] & {
            nutrientTargets: NexusGenFieldTypes["NutrientTarget"] &
              {
                nutrient: NexusGenFieldTypes["Nutrient"]
              }[]
          }
        }
      | null
      | undefined
  }

  it("returns the user's active profile", async () => {
    const result: GetActiveProfileResponse = await server.executeOperation({
      query: getActiveProfileQuery,
    })

    expect(result.errors).toBeUndefined()

    expect(result.data?.activeNutrientProfile?.id).toEqual(
      currentUserActiveProfile.id
    )
    expect(result.data?.activeNutrientProfile?.nutrientTargets[0]?.min).toEqual(
      42
    )
    expect(
      result.data?.activeNutrientProfile?.nutrientTargets[0]?.nutrient?.name
    ).toEqual("carbs")
  })

  it("updates a profile to active if user has no active profiles", async () => {
    await db.nutrientProfile.update({
      where: { id: currentUserActiveProfile.id },
      data: { isActive: false },
    })

    const result: GetActiveProfileResponse = await server.executeOperation({
      query: getActiveProfileQuery,
    })

    expect(result.errors).toBeUndefined()

    expect(result.data?.activeNutrientProfile?.id).toEqual(
      currentUserActiveProfile.id
    )

    expect(result.data?.activeNutrientProfile?.isActive).toEqual(true)
  })

  it("creates a default profile if user has no profiles", async () => {
    // Make the query as a random user with no profiles

    const result: GetActiveProfileResponse =
      await newUserContext.executeOperation({
        query: getActiveProfileQuery,
      })

    expect(result.errors).toBeUndefined()

    expect(result.data?.activeNutrientProfile?.isActive).toEqual(true)
  })
})
