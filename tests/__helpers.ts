import { ApolloServer } from "apollo-server"
import db from "../src/config/db"
import schema from "../src/config/schema"

// eslint-disable-next-line import/prefer-default-export
const createTestServer = (): ApolloServer => {
  const ctx = { db }
  const server = new ApolloServer({
    schema,
    context: () => ctx,
  })

  afterAll(() => {
    void db.$disconnect()
  })

  return server
}

export default createTestServer
