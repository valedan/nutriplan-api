/* eslint-disable import/prefer-default-export */
import {
  objectType,
  nonNull,
  intArg,
  list,
  queryField,
  mutationField,
  inputObjectType,
} from "nexus"
import PlanService from "../services/plan"

// INPUTS

export const CreatePlanInput = inputObjectType({
  name: "CreatePlanInput",
  definition(t) {
    t.nonNull.string("name")
    t.nonNull.datetime("startDate")
    t.nonNull.datetime("endDate")
  },
})

export const UpdatePlanInput = inputObjectType({
  name: "UpdatePlanInput",
  definition(t) {
    t.nonNull.int("id")
    t.string("name")
    t.datetime("startDate")
    t.datetime("endDate")
  },
})

// QUERIES

export const getPlan = queryField("plan", {
  type: "Plan",
  args: { id: nonNull(intArg()) },
  resolve: (_root, { id }, ctx) => PlanService.getPlan(id, ctx),
})

export const getPlans = queryField("plans", {
  type: nonNull(list(nonNull("Plan"))),
  resolve: (_root, _args, ctx) => PlanService.getPlans(ctx),
})

export const createPlan = mutationField("createPlan", {
  type: "Plan",
  args: { input: nonNull(CreatePlanInput) },
  resolve: (_root, { input }, ctx) => PlanService.createPlan(input, ctx),
})

export const updatePlan = mutationField("updatePlan", {
  type: "Plan",
  args: { input: nonNull(UpdatePlanInput) },
  resolve: (_root, { input }, ctx) => PlanService.updatePlan(input, ctx),
})

export const deletePlan = mutationField("deletePlan", {
  type: "Plan",
  args: { id: nonNull(intArg()) },
  resolve: (_root, { id }: { id: number }, ctx) =>
    PlanService.deletePlan(id, ctx),
})

// TYPES

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

    t.field("plan", {
      type: "Plan",
      resolve: ({ id }, _args, ctx) =>
        ctx.db.meal.findUnique({ where: { id } }).plan(),
    })
  },
})
