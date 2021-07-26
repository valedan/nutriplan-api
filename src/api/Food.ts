import { objectType, extendType, nonNull, intArg } from "nexus";

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
  },
});

export const Food = objectType({
  name: "Food",
  definition(t) {
    t.int("id");
    t.string("description");
    t.string("category");
    t.string("brand");
  },
});
