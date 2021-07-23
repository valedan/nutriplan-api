require("dotenv").config({ path: ".env.test" });
import { db } from "./src/db";

module.exports = async () => {
  await db.$disconnect();
};
