/* eslint-disable import/prefer-default-export */
import {
  objectType,
  nonNull,
  intArg,
  list,
  stringArg,
  enumType,
  queryField,
} from "nexus"
import FoodService from "../services/food"

export const getFood = queryField("food", {
  type: "Food",
  args: { id: nonNull(intArg()) },
  resolve: (_root, { id }, ctx) => FoodService.getFood(id, ctx),
})

export const getFoods = queryField("foods", {
  type: nonNull(list(nonNull("Food"))),
  args: {
    ids: nonNull(list(nonNull(intArg()))),
  },
  resolve: (_root, { ids }, ctx) => FoodService.getFoods(ids, ctx),
})

export const searchFoods = queryField("searchFoods", {
  type: list("Food"),
  args: { searchTerm: nonNull(stringArg()) },
  resolve: (_root, { searchTerm }, ctx) =>
    FoodService.searchFoods(searchTerm, ctx),
})

export const ServingSizeUnit = enumType({
  name: "ServingSizeUnit",
  members: ["g", "ml"],
})

export const ServingSize = objectType({
  name: "ServingSize",
  definition(t) {
    t.nonNull.float("amount")
    t.nonNull.string("description")
    t.nonNull.field("unit", { type: nonNull(ServingSizeUnit) })
  },
})

export const Food = objectType({
  name: "Food",
  definition(t) {
    t.nonNull.int("id")
    t.nonNull.string("dataSource")

    t.nonNull.string("description")
    t.string("category")
    t.string("brandName")
    t.float("searchScore")
    t.nonNull.int("nutrientCount")

    t.nonNull.field("portions", {
      type: nonNull(list(nonNull("Portion"))),
      resolve: ({ id }, _args, ctx) => FoodService.getPortionsForFood(id, ctx),
    })

    t.field("nutrients", {
      type: nonNull(list(nonNull("FoodNutrient"))),
      resolve: async ({ id }, _args, ctx) => {
        const foodNutrients = await ctx.db.food
          .findUnique({
            where: { id },
          })
          .foodNutrients({ include: { nutrient: true } })

        return foodNutrients.map((foodNutrient) => ({
          ...foodNutrient.nutrient,
          amount: foodNutrient.amount,
        }))
      },
    })
  },
})

export const Portion = objectType({
  name: "Portion",
  definition(t) {
    t.nonNull.string("measure")
    t.nonNull.float("gramWeight")
  },
})

export const FoodNutrient = objectType({
  name: "FoodNutrient",
  definition(t) {
    // a Nutrient from the database with the amount in this food
    t.nonNull.int("id")
    t.nonNull.float("amount")
    t.nonNull.string("name")
    t.nonNull.string("unit")
  },
})
