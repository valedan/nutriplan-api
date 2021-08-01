import db from "../src/config/db";

// eslint-disable-next-line
require("dotenv").config({ path: ".env.test" });

module.exports = async () => {
  await db.$disconnect();
};
