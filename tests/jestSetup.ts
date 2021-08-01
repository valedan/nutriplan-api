import { join } from "path";
import { execSync } from "child_process";

// eslint-disable-next-line
require("dotenv").config({ path: ".env.test" });

module.exports = () => {
  const prismaBinary = join(__dirname, "..", "node_modules", ".bin", "prisma");
  execSync(`${prismaBinary} migrate reset --force`);
  execSync(`${prismaBinary} db push`);
};
