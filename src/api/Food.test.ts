/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { gql } from "graphql-request"
import { Food } from "@prisma/client"
import db from "../config/db"

import createTestServer from "../../tests/__helpers"

const server = createTestServer()

let pizza: Food

beforeAll(async () => {
  pizza = await db.food.create({
    data: { description: "pizza", data_source: "test" },
  })
})

it("returns the requested food", async () => {
  const query = gql`
    query getFood($id: Int!) {
      food(id: $id) {
        id
        description
      }
    }
  `
  const result = await server.executeOperation({
    query,
    variables: { id: pizza.id },
  })

  expect(result).toMatchInlineSnapshot(
    {
      data: { food: { id: expect.any(Number) } },
    },
    `
Object {
  "data": Object {
    "food": Object {
      "description": "pizza",
      "id": Any<Number>,
    },
  },
  "errors": undefined,
  "extensions": undefined,
  "http": Object {
    "headers": Headers {
      Symbol(map): Object {},
    },
  },
}
`
  )
})
