import { GraphQLDate, GraphQLDateTime } from "graphql-scalars"
import { asNexusMethod } from "nexus"

export const GQLDate = asNexusMethod(GraphQLDate, "date")
export const GQLDateTime = asNexusMethod(GraphQLDateTime, "datetime")
