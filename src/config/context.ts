import { ExpressContext } from "apollo-server-express"
import { PrismaClient } from "@prisma/client"
import verifyToken from "../services/auth/verifyToken"
import { User } from "../types/User"
import db from "./db"

export interface MyContext extends ExpressContext {
  db: PrismaClient
  auth: {
    isAuthenticated: boolean
    user: User
  }
}

export const context = async ({
  req,
  ...rest
}: ExpressContext): Promise<MyContext> => {
  let isAuthenticated = false
  const user: User = { id: "" }
  const authHeader = req.headers?.authorization || ""

  if (authHeader) {
    const token = authHeader.split(" ")[1]
    const payload = await verifyToken(token)
    if (payload?.sub) {
      isAuthenticated = true
      user.id = payload.sub
    }
  }

  if (!isAuthenticated) {
    // Remove this and do per-field auth with Nexus `authorize` if I ever need some public portions of api
    // throw new AuthenticationError("Not authenticated")
  }

  return {
    ...rest,
    db,
    req,
    auth: { isAuthenticated, user },
  }
}
