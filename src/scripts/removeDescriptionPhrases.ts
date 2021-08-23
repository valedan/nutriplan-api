/* eslint-disable no-console */
// require("dotenv").config({ path: "../../.env.development" });
import { PrismaClient } from "@prisma/client";

const PHRASES = [
  "(Includes foods for USDA's Food Distribution Program)",
  "(garbanzo beans, bengal gram), ",
  ", broilers or fryers",
  ", broiler or fryers",
];

const DATA_SOURCES = ["usda_sr_legacy_food", "usda_survey_fndds_food", "usda_foundation_food"];

const prisma = new PrismaClient();

const removePhrases = async () => {
  let index = 0;
  const foods = await prisma.food.findMany({ where: { data_source: { in: DATA_SOURCES } } });
  for await (const food of foods) {
    if (PHRASES.some((phrase) => food.description.includes(phrase))) {
      let newDescription = food.description || "";
      PHRASES.forEach((phrase) => {
        newDescription = newDescription.replace(phrase, "");
      });
      await prisma.food.update({ where: { id: food.id }, data: { description: newDescription } });
    }
    index += 1;
    console.log(index);
  }
};

removePhrases()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
