/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
// create a denormalized portion sheet to manaully tweak before import

import "dotenv/config";
import parse from "csv-parse";
import stringify from "csv-stringify";
import fs from "fs";
import { Food, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FOOD_PORTION_PATH = `./data/food_portion.csv`;
const MEASURE_UNIT_PATH = `./data/measure_unit.csv`;

const OUTPUT_PATH = `./data/tidy_food_portion.csv`;

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: OUTPUT_PATH,
  header: [
    { id: "id", name: "id" },
    { id: "fdc_id", name: "fdc_id" },
    { id: "food_name", name: "food_name" },
    { id: "seq_num", name: "seq_num" },
    { id: "amount", name: "amount" },
    { id: "measure_unit_id", name: "measure_unit_id" },
    { id: "portion_description", name: "portion_description" },
    { id: "modifier", name: "modifier" },
    { id: "gram_weight", name: "gram_weight" },
    { id: "data_points", name: "data_points" },
    { id: "footnote", name: "footnote" },
    { id: "min_year_acquired", name: "min_year_acquired" },
  ],
});
type MeasureUnitRow = {
  id: number;
  name: string;
};
type FoodPortionRow = {
  id: number;
  fdc_id: number;
  seq_num: number | "";
  amount: number;
  measure_unit_id: number;
  portion_description: string;
  modifier: string;
  gram_weight: number;
  data_points: number;
  footnote: number;
  min_year_acquired: number | "";
};

const measureUnits: { [key: string]: string } = {};

const openFile = (path: string, toLine?: number) => {
  const opts: parse.Options = { columns: true, cast: true };

  if (toLine) {
    opts.toLine = toLine;
  }

  return fs.createReadStream(path).pipe(parse(opts));
};

const loadMeasureUnits = async () => {
  const measuresFile = openFile(MEASURE_UNIT_PATH);
  for await (const row of measuresFile) {
    const typedRow: MeasureUnitRow = row as MeasureUnitRow;
    measureUnits[typedRow.id] = typedRow.name;
  }
};

const loadPortionData = async () => {
  await loadMeasureUnits();
  const portionFile = openFile(FOOD_PORTION_PATH);
  let counter = 0;
  for await (const row of portionFile) {
    counter += 1;
    const food = await prisma.food.findFirst({ where: { id: row.fdc_id } });
    row.measure_unit_id = measureUnits[row.measure_unit_id];
    row.food_name = food?.description;
    await csvWriter.writeRecords([row]);
    console.log(`Created Portion ${counter}`);
  }
};

const main = async () => {
  await loadPortionData();
};

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
