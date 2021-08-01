/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { gql } from "graphql-request";
import { Food } from "@prisma/client";
import { createTestContext } from "../../tests/__helpers";

const ctx = createTestContext();

let pizza: Food;

beforeAll(async () => {
  pizza = await ctx.db.food.create({ data: { description: "pizza", data_source: "test" } });
});

it("returns the requested food", async () => {
  const query = gql`
    query getFood($id: Int!) {
      food(id: $id) {
        id
        description
      }
    }
  `;

  const result = await ctx.client.request(query, { id: pizza.id });

  expect(result).toMatchInlineSnapshot(
    { food: { id: expect.any(Number) } },
    `
Object {
  "food": Object {
    "description": "pizza",
    "id": Any<Number>,
  },
}
`
  );
});
