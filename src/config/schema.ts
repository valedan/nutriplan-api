import { makeSchema, fieldAuthorizePlugin } from "nexus"
import { join } from "path"
import * as types from "../api"

export default makeSchema({
  types,
  outputs: {
    typegen: join(__dirname, "nexus-typegen.ts"),
    schema: join(__dirname, "schema.graphql"),
  },
  contextType: {
    module: join(__dirname, "context.ts"),
    export: "MyContext",
  },
  plugins: [fieldAuthorizePlugin()],
})
