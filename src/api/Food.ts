import { objectType, extendType, nonNull, intArg, list, stringArg } from "nexus";
import AppSearchClient from "@elastic/app-search-node";

export const FoodQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("food", {
      type: "Food",
      args: { id: nonNull(intArg()) },
      resolve(_root, args, ctx) {
        const food = ctx.db.food.findUnique({ where: { id: args.id } });
        return food;
      },
    });

    t.field("searchFoods", {
      type: list("Food"),
      args: { searchTerm: nonNull(stringArg()) },
      async resolve(_root, args, ctx) {
        const { searchTerm } = args;
        const andSearchTerm = searchTerm.split(" ").join(" AND ");
        console.log(andSearchTerm);
        const elastic = new AppSearchClient(
          undefined,
          process.env.ELASTIC_APP_SEARCH_API_KEY,
          () => process.env.ELASTIC_APP_SEARCH_URL ?? ""
        );
        let resp;
        try {
          resp = await elastic.search("food", searchTerm, {
            page: { size: 50 },
            result_fields: { id: { raw: {} }, description: { raw: {} } },
            precision: 3,
            search_fields: {
              description: {},
              category: {},
              // ingredients: {},
            },
            // The app search UI only supports text boosts with an "add" operation
            boosts: {
              data_source: [
                {
                  type: "value",
                  value: "usda_sr_legacy_food",
                  operation: "multiply",
                  factor: 3,
                },
                {
                  type: "value",
                  value: "usda_foundation_food",
                  operation: "multiply",
                  factor: 4,
                },
                {
                  type: "value",
                  value: "usda_survey_fndds_food",
                  operation: "multiply",
                  factor: 2,
                },
                {
                  type: "value",
                  value: "usda_branded_food",
                  operation: "multiply",
                  factor: 1,
                },
              ],
              category: [
                {
                  type: "value",
                  value: "Liquor and cocktails",
                  operation: "multiply",
                  factor: 0.5,
                },
                {
                  type: "value",
                  value: ["Baby food: vegetable", "Baby food: meat and dinners", "Baby juice"],
                  operation: "multiply",
                  factor: 0.5,
                },
                {
                  type: "value",
                  value: [
                    "Bean, pea, legume dishes",
                    "Meat mixed dishes",
                    "Other Mexican mixed dishes",
                    "Pasta mixed dishes, excludes macaroni and cheese",
                    "Poultry mixed dishes",
                    "Seafood mixed dishes",
                    "Rice mixed dishes",
                    "Vegetable dishes",
                  ],
                  operation: "multiply",
                  factor: 0.5,
                },
              ],
            },
          });
        } catch (e) {
          console.log(e);
        }
        console.log("elastic:");
        console.log(resp);
        console.log(JSON.stringify(resp, null, 2));
        const elasticIds = resp.results.map((result: { id: { raw: string } }) => parseInt(result.id.raw, 10));
        console.log(elasticIds);

        const foodsWithPortions = await ctx.db.food.findMany({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          where: { id: { in: elasticIds } },
          include: { food_nutrients: { include: { nutrient: true } } },
          // include: { _count: { select: { food_nutrients: true } } },
        });
        const start = new Date();
        foodsWithPortions.sort((a, b) => elasticIds.indexOf(a.id) - elasticIds.indexOf(b.id));
        console.log(new Date() - start);
        console.log("prisma:");
        console.log(foodsWithPortions.map((food) => food.id));
        const foodsWithScores = foodsWithPortions.map((food) => ({
          ...food,
          searchScore: resp.results.find((result) => parseInt(result.id.raw, 10) === food.id)["_meta"].score,
        }));
        let prioritizedFoods = prioritizeExactMatches(foodsWithScores, searchTerm);
        prioritizedFoods = prioritizeMoreNutrients(prioritizedFoods);
        const sortedFoods = prioritizedFoods.sort((a, b) => b.searchScore - a.searchScore);
        console.log(sortedFoods);

        return sortedFoods;
      },
    });
  },
});

const EXACT_MATCH_WEIGHT = 3;
const NUTRIENT_COUNT_WEIGHT = 0.3;

const prioritizeMoreNutrients = (foods: Food[]): Food[] => {
  const prioritizedFoods = foods.map((food) => {
    const nutrientCount = food.food_nutrients.length;
    console.log(nutrientCount);
    return {
      ...food,
      searchScore: food.searchScore + nutrientCount * NUTRIENT_COUNT_WEIGHT,
    };
  });
  return prioritizedFoods;
};

const prioritizeExactMatches = (foods: Food[], searchTerm: string) => {
  const priroritizedFoods = foods.map((food) => {
    if (food.description.trim().toLowerCase() === searchTerm.trim().toLowerCase()) {
      return {
        ...food,
        searchScore: food.searchScore * EXACT_MATCH_WEIGHT,
      };
    }
    return food;
  });
  return priroritizedFoods;
  // const exactMatches = foods.filter(
  //   (food) => food.description.trim().toLowerCase() === searchTerm.trim().toLowerCase()
  // );
  // const exactMatchIds = exactMatches.map((food) => food.id);
  // return [...exactMatches, ...foods.filter((food) => !exactMatchIds.includes(food.id))];
};

export const Portion = objectType({
  name: "Portion",
  definition(t) {
    t.int("id");
    t.string("measure");
    t.float("gram_weight");
    t.int("sequence_number");
  },
});

export const Nutrient = objectType({
  name: "Nutrient",
  definition(t) {
    t.int("id");
    t.string("name");
  },
});

export const FoodNutrient = objectType({
  name: "FoodNutrient",
  definition(t) {
    t.int("id");
    t.field("nutrient", { type: "Nutrient" });
  },
});

export const Food = objectType({
  name: "Food",
  definition(t) {
    t.int("id");
    t.string("description");
    t.string("category");
    t.string("brand");
    t.string("data_source");
    t.string("category");
    t.string("brand");
    t.float("serving_size");
    t.string("ingredients");
    t.float("searchScore");
    t.field("portions", { type: list("Portion") });
    t.field("food_nutrients", { type: list("FoodNutrient") });
  },
});
