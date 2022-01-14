import { PrismaClient } from "@prisma/client"
import { format } from "sql-formatter"
import chalk from "chalk"

const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "stdout",
      level: "error",
    },
    {
      emit: "stdout",
      level: "info",
    },
    {
      emit: "stdout",
      level: "warn",
    },
  ],
})

prisma.$on("query", (e) => {
  if (process.env.NODE_ENV === "development") {
    console.log(format(e.query, { language: "postgresql" }))
    console.log(chalk.underline(`Duration: ${e.duration}ms\n`))
  }
})

export default prisma
