/* eslint-disable import/prefer-default-export */
import { objectType, nonNull, intArg, list, queryField } from "nexus"

export const PlansQuery = queryField("plans", {
  type: nonNull(list(nonNull("Plan"))),
  args: {
    ids: nonNull(list(nonNull(intArg()))),
  },
  resolve: (_root, { ids }, ctx) =>
    ctx.db.plan.findMany({ where: { id: { in: ids } } }),
})

export const PlanQuery = queryField("plan", {
  type: "Plan",
  args: { id: nonNull(intArg()) },
  resolve: (_root, { id }, ctx) => ctx.db.plan.findUnique({ where: { id } }),
})

export const Plan = objectType({
  name: "Plan",
  definition(t) {
    t.nonNull.int("id")
    t.string("name")
    t.datetime("startDate")
    t.datetime("endDate")

    t.field("meals", {
      type: nonNull(list(nonNull("Meal"))),
      resolve: ({ id }, _args, ctx) =>
        ctx.db.plan.findUnique({ where: { id } }).meals(),
    })

    t.field("ingredients", {
      type: nonNull(list(nonNull("Ingredient"))),
      resolve: ({ id }, _args, ctx) =>
        ctx.db.plan.findUnique({ where: { id } }).ingredients(),
    })
  },
})

export const Meal = objectType({
  name: "Meal",
  definition(t) {
    t.nonNull.int("id")
    t.nonNull.int("servings")
    t.int("order")

    t.field("ingredients", {
      type: nonNull(list(nonNull("Ingredient"))),
      resolve: ({ id }, _args, ctx) =>
        ctx.db.meal.findUnique({ where: { id } }).ingredients(),
    })

    t.field("recipe", {
      type: "Recipe",
      resolve: ({ id }, _args, ctx) =>
        ctx.db.meal.findUnique({ where: { id } }).recipe(),
    })
  },
})
