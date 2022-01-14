import { ExpressContext } from "apollo-server-express"
import { PrismaClient } from "@prisma/client"
import chalk from "chalk"
import verifyToken from "../services/auth/verifyToken"
import getActiveProfileOrCreateDefault from "../services/nutrientProfile/getActiveProfileOrCreateDefault"
import { User } from "../types/User"
import db from "./db"
import { createLoaders } from "../dataLoaders"

export interface MyContext extends ExpressContext {
  db: PrismaClient
  auth: {
    isAuthenticated: boolean
    user: User
  }
  loaders: ReturnType<typeof createLoaders>
}

export const context = async ({
  req,
  ...rest
}: ExpressContext): Promise<MyContext> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (req.body.operationName !== "IntrospectionQuery") {
    console.log(chalk.cyanBright.bold("\nRECEIVED REQUEST"))
  }
  let isAuthenticated = false
  const user: User = { id: "" }
  const authHeader = req.headers?.authorization || ""

  if (authHeader) {
    const token = authHeader.split(" ")[1]
    const payload = await verifyToken(token)
    if (payload?.sub) {
      isAuthenticated = true
      user.id = payload.sub
      // TODO: This is a mildly expensive operation, do it at the resolver level when user hits an endpoint that needs a profile
      await getActiveProfileOrCreateDefault(user.id, db)
    }
  }

  if (!isAuthenticated) {
    // Remove this and do per-field auth with Nexus `authorize` if I ever need some public portions of api
    // throw new AuthenticationError("Not authenticated")
  }

  const loaders = createLoaders(db, user.id)

  return {
    ...rest,
    db,
    req,
    auth: { isAuthenticated, user },
    loaders,
  }
}
