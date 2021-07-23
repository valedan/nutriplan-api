require("dotenv").config({ path: ".env.test" });
import { join } from "path";
import { execSync } from "child_process";

module.exports = async () => {
  const prismaBinary = join(__dirname, "node_modules", ".bin", "prisma");
  execSync(`${prismaBinary} migrate reset --force`);
  execSync(`${prismaBinary} db push`);
};
