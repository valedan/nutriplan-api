import { ApolloServer } from "apollo-server"
import db from "../src/config/db"
import schema from "../src/config/schema"
import { MyContext } from "../src/config/context"

// eslint-disable-next-line import/prefer-default-export

interface TestServerOptions {
  userId?: string
}

const createTestServer = ({ userId }: TestServerOptions): ApolloServer => {
  const ctx: Partial<MyContext> = { db }
  if (userId) {
    ctx.auth = { isAuthenticated: true, user: { id: userId } }
  }
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
