import { objectType, extendType, nonNull, intArg, list, stringArg } from "nexus";
import { searchFoods } from "../services/elastic/search";

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
      async resolve(_root, { searchTerm }) {
        const results = await searchFoods(searchTerm);
        return results;
      },
    });
  },
});

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
    t.float("amount");
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
