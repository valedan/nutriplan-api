import { ApolloServer } from "apollo-server";
import { context } from "./context";
import { schema } from "./schema";

console.log("test");
export const server = new ApolloServer({ schema, context });
