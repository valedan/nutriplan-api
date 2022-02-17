import { GraphQLDate, GraphQLDateTime } from "graphql-scalars"
import { decorateType } from "nexus"

export const GQLDate = decorateType(GraphQLDate, {
  sourceType: "Date",
  asNexusMethod: "date",
})

export const GQLDateTime = decorateType(GraphQLDateTime, {
  sourceType: "Date",
  asNexusMethod: "datetime",
})
