import { PrismaClient } from "@prisma/client";
import { FoodBufferEntry, BrandedFoodRow, FoodAttributeRow, ConversionFactor, FoodRow } from "./types";
import { openFile, loadWWEIAMappings, loadConversionFactors } from "./utils";

const FOOD_ATTRIBUTE_PATH = `./data/food_attribute.csv`; // MUST BE SORTED BY FDC_ID
const BRANDED_FOOD_PATH = `./data/branded_food.csv`;
const FOOD_PATH = `./data/food.csv`;
const FOOD_ROW_LIMIT = undefined;

let foodBuffer: { [key: string]: FoodBufferEntry } = {};
let wweiaCategories: { [key: string]: string } = {};
let conversionFactors: { [key: string]: ConversionFactor } = {};

const fetchBrandData = async () => {
  let brandsToFind = Object.values(foodBuffer).filter((record) => record.data_type === "branded_food").length;
  console.log(`Brands to find: ${brandsToFind}`);

  if (brandsToFind === 0) {
    return;
  }

  const brandFile = openFile(BRANDED_FOOD_PATH);
  for await (const row of brandFile) {
    if (brandsToFind === 0) {
      break;
    }
    const typedRow: BrandedFoodRow = row as BrandedFoodRow;

    if (foodBuffer[typedRow.fdc_id]) {
      foodBuffer[typedRow.fdc_id].brand_owner = typedRow.brand_owner;
      foodBuffer[typedRow.fdc_id].gtin_upc = typedRow.gtin_upc;
      foodBuffer[typedRow.fdc_id].ingredients = typedRow.ingredients;
      foodBuffer[typedRow.fdc_id].serving_size = typedRow.serving_size;
      foodBuffer[typedRow.fdc_id].serving_size_unit = typedRow.serving_size_unit;
      foodBuffer[typedRow.fdc_id].household_serving_fulltext = typedRow.household_serving_fulltext;
      foodBuffer[typedRow.fdc_id].branded_food_category = typedRow.branded_food_category;
      brandsToFind -= 1;
      console.log(`Brands to find: ${brandsToFind}`);
    }
  }
  console.log("finished brand loop");
};

const fetchFoodAttributeData = async () => {
  const maxId = Math.max(...Object.keys(foodBuffer).map((key) => parseInt(key, 10)));
  const foodAttributeFile = openFile(FOOD_ATTRIBUTE_PATH);
  let counter = 0;
  for await (const row of foodAttributeFile) {
    counter += 1;
    console.log(`food attribute ${counter}`);
    const typedRow: FoodAttributeRow = row as FoodAttributeRow;
    if (typedRow.fdc_id > maxId) {
      break;
    }
    if (foodBuffer[typedRow.fdc_id]) {
      if (typedRow.food_attribute_type_id === 1000) {
        foodBuffer[typedRow.fdc_id].commonNames = typedRow.value.toString();
      } else if (typedRow.food_attribute_type_id === 1001) {
        if (foodBuffer[typedRow.fdc_id].additionalDescriptions) {
          foodBuffer[typedRow.fdc_id].additionalDescriptions?.push(typedRow.value.toString());
        } else {
          foodBuffer[typedRow.fdc_id].additionalDescriptions = [typedRow.value.toString()];
        }
      } else if (typedRow.food_attribute_type_id === 999) {
        if (foodBuffer[typedRow.fdc_id].wweiaCategory) {
          throw new Error(
            `Duplicate descriptions for food buffer entry (${foodBuffer[typedRow.fdc_id].wweiaCategory || ""}, ${
              typedRow.value
            }) Full entry - ${foodBuffer[typedRow.fdc_id].toString()}`
          );
        }
        if (typedRow.value === "WWEIA Category description") {
          foodBuffer[typedRow.fdc_id].wweiaCategory = typedRow.value.toString();
        } else if (typedRow.value === "WWEIA Category number") {
          foodBuffer[typedRow.fdc_id].wweiaCategory = wweiaCategories[typedRow.value];
        }
      }
    }
  }
};

const writeFoods = async (prisma: PrismaClient) => {
  console.log("flushing buffer");
  await fetchBrandData();
  await fetchFoodAttributeData();

  // await prisma.food.createMany({
  //   data: Object.values(foodBuffer).map((row) => {
  //     const possibleCategories = [row.food_category_id, row.branded_food_category, row.wweiaCategory].filter.length;
  //     if (possibleCategories > 1) {
  //       console.log(`Possible categories: ${possibleCategories}`);
  //     }
  //     return {
  //       id: row.fdc_id,
  //       data_source: `usda_${row.data_type}`,
  //       description: row.description.toString(),
  //       category: (row.food_category_id
  //         ? wweiaCategories[row.food_category_id]
  //         : row.branded_food_category || row.wweiaCategory
  //       )?.toString(),
  //       brand: row.brand_owner?.toString(),
  //       common_names: row.commonNames?.toString(),
  //       additional_descriptions: row.additionalDescriptions,
  //       gtin_upc: row.gtin_upc?.toString(),
  //       ingredients: row.ingredients?.toString(),
  //       serving_size: row.serving_size ? row.serving_size : undefined,
  //       serving_size_unit: row.serving_size_unit ? row.serving_size_unit : undefined,
  //       serving_size_description: row.household_serving_fulltext?.toString(),
  //       protein_calorie_conversion_factor: conversionFactors[row.fdc_id]?.protein_value
  //         ? conversionFactors[row.fdc_id].protein_value
  //         : undefined,
  //       fat_calorie_conversion_factor: conversionFactors[row.fdc_id]?.fat_value
  //         ? conversionFactors[row.fdc_id]?.fat_value
  //         : undefined,
  //       carbohydrate_conversion_factor: conversionFactors[row.fdc_id]?.carbohydrate_value
  //         ? conversionFactors[row.fdc_id]?.carbohydrate_value
  //         : undefined,
  //     };
  //   }),
  // });
  await prisma.portion.createMany({
    data: Object.values(foodBuffer).map((row) => {
      return {
        food_id: row.fdc_id,
        sequence_number: 100,
        measure: "g",
        gram_weight: 1,
      };
    }),
  });
  await prisma.portion.createMany({
    data: Object.values(foodBuffer)
      .filter((row) => row.serving_size)
      .map((row) => {
        return {
          food_id: row.fdc_id,
          sequence_number: 0,
          measure: row.household_serving_fulltext?.toString() || "serving",
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          gram_weight: row.serving_size!,
        };
      }),
  });
  foodBuffer = {};
  console.log("flushed buffer");
};

export const loadFoodData = async (prisma: PrismaClient) => {
  wweiaCategories = await loadWWEIAMappings();
  conversionFactors = await loadConversionFactors();
  const foodFile = openFile(FOOD_PATH, FOOD_ROW_LIMIT);
  let counter = 0;
  let bufferCounter = 0;
  for await (const row of foodFile) {
    const typedRow: FoodRow = row as FoodRow;
    counter += 1;
    bufferCounter += 1;

    foodBuffer[typedRow.fdc_id] = typedRow;
    // 5000 = 700s
    // 50000 = 190s
    // 100000 = 175s
    if (bufferCounter > 50000) {
      await writeFoods(prisma);
      bufferCounter = 0;
    }
    console.log(`Created Food ${counter}/${533613}`);
  }

  await writeFoods(prisma);
};
