import { PrismaClient } from "@prisma/client";
import { ServerInfo } from "apollo-server";
import getPort, { makeRange } from "get-port";
import { GraphQLClient } from "graphql-request";
import { db } from "../src/config/db";
import { server } from "../src/config/server";

type TestContext = {
  client: GraphQLClient;
  db: PrismaClient;
};

export function createTestContext(): TestContext {
  let ctx = {} as TestContext;
  const graphqlCtx = graphqlTestContext();

  beforeAll(async () => {
    const client = await graphqlCtx.before();

    Object.assign(ctx, {
      client,
      db,
    });
  });

  afterAll(async () => {
    await graphqlCtx.after();
  });

  return ctx;
}

function graphqlTestContext() {
  let serverInstance: ServerInfo | null = null;

  return {
    async before() {
      const port = await getPort({ port: makeRange(4000, 6000) });
      serverInstance = await server.listen({ port });
      // Close the Prisma Client connection when the Apollo Server is closed
      serverInstance.server.on("close", async () => {
        db.$disconnect();
      });
      return new GraphQLClient(`http://localhost:${port}`);
    },

    async after() {
      serverInstance?.server.close();
    },
  };
}
