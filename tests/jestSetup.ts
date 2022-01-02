import { join } from "path"
import { execSync } from "child_process"
import { seedNutrients } from "../prisma/seed"

// eslint-disable-next-line
require("dotenv").config({ path: ".env.test" })

module.exports = async () => {
  const prismaBinary = join(__dirname, "..", "node_modules", ".bin", "prisma")
  execSync(`${prismaBinary} migrate reset --force`)
  execSync(`${prismaBinary} db push`)
  await seedNutrients()
}
