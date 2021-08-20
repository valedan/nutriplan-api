/* eslint-disable no-console */
// require("dotenv").config({ path: "../../.env.development" });
import { PrismaClient } from "@prisma/client";
import { openFile } from "./usdaImport/utils";
import { SRGroupRow, SRFoodRow, SRLegacyFoodRow } from "./usdaImport/types";
const SR_GROUP_PATH = "./data/sr_groups.csv";
const SR_FOODS_PATH = "./data/sr_foods.csv";
const SR_LEGACY_FOODS_PATH = "./data/sr_legacy_food.csv";

const loadFoodGroups = async () => {
  // load groups from sr_groups
  // load ndb_ids and group_ids from sr_foods
  // load ndb_id and fdc_id from sr_legacy_food
  // combine this data to create map of fdc_id -> group_name
  // iterate through all prisma food items and add group_name

  const groupFile = openFile(SR_GROUP_PATH);
  const groupMembershipsFile = openFile(SR_FOODS_PATH);
  const ndbFdcIdsFile = openFile(SR_LEGACY_FOODS_PATH);
  const groups: { [key: string]: string } = {};
  const groupMemberships: { [key: string]: string } = {};
  const foodsToGroups: { [key: string]: string } = {};
  for await (const row of groupFile) {
    const typedRow: SRGroupRow = row as SRGroupRow;
    groups[typedRow.id] = typedRow.name;
  }
  for await (const row of groupMembershipsFile) {
    const typedRow: SRFoodRow = row as SRFoodRow;
    groupMemberships[typedRow.ndb_id] = typedRow.group_id;
  }
  for await (const row of ndbFdcIdsFile) {
    const typedRow: SRLegacyFoodRow = row as SRLegacyFoodRow;
    foodsToGroups[typedRow.fdc_id] = groups[groupMemberships[typedRow.NDB_number]];
  }
  return foodsToGroups;
};

const addSrGroups = async (prisma: PrismaClient) => {
  let index = 0;
  const foodGroups = await loadFoodGroups();
  const foods = await prisma.food.findMany({ where: { data_source: "usda_sr_legacy_food" } });
  for await (const food of foods) {
    const foodGroup = foodGroups[food.id];
    await prisma.food.update({ where: { id: food.id }, data: { category: foodGroup } });
    index += 1;
    console.log(index);
  }
};

const prisma = new PrismaClient();

const importData = async () => {
  await addSrGroups(prisma);
};

importData()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
