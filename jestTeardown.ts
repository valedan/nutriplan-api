require("dotenv").config({ path: ".env.test" });
import { db } from "./src/config/db";

module.exports = async () => {
  await db.$disconnect();
};
