import { ApolloServer } from "apollo-server"
import { context } from "./context"
import schema from "./schema"

export default new ApolloServer({
  schema,
  context,
  // TODO: put these in env vars
  cors: { origin: ["http://localhost:3000", "https://nutriplan.vercel.app"] },
})
