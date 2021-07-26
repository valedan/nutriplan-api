import { createTestContext } from "../../tests/__helpers";
import { gql } from "graphql-request";
import { Food } from "@prisma/client";

const ctx = createTestContext();

let pizza: Food | null;

beforeAll(async () => {
  pizza = await ctx.db.food.create({ data: { description: "pizza", data_source: "test" } });
});

it("returns the requested food 1", async () => {
  const query = gql`
    query getFood($id: Int!) {
      food(id: $id) {
        id
        description
      }
    }
  `;

  const result = await ctx.client.request(query, { id: pizza?.id });
  expect(result).toMatchInlineSnapshot(`
Object {
  "food": Object {
    "description": "pizza",
    "id": ${pizza?.id},
  },
}
`);
});
