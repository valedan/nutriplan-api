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
import { omitBy, isNil } from "lodash"
import { NotFoundError } from "./shared/errors"

export const getPlan = queryField("plan", {
  type: "Plan",
  args: { id: nonNull(intArg()) },
  resolve: async (_root, { id }, ctx) => {
    const plan = await ctx.db.plan.findFirst({
      where: { id, userId: ctx.auth.user.id },
    })
    if (!plan) throw new NotFoundError("Plan")
    return plan
  },
})

export const getPlans = queryField("plans", {
  type: nonNull(list(nonNull("Plan"))),
  resolve: (_root, _args, ctx) =>
    ctx.db.plan.findMany({ where: { userId: ctx.auth.user.id } }),
})

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

export const createPlan = mutationField("createPlan", {
  type: "Plan",
  args: { input: nonNull(CreatePlanInput) },
  resolve: async (_root, { input }, ctx) => {
    const plan = await ctx.db.plan.create({
      data: { userId: ctx.auth.user.id, ...input },
    })
    return plan
  },
})

export const updatePlan = mutationField("updatePlan", {
  type: "Plan",
  args: { input: nonNull(UpdatePlanInput) },
  resolve: async (_root, { input: { id, ...updateData } }, ctx) => {
    // the `where` arg for `update` only accepts unique fields, so can't put userId in it
    const plan = await ctx.db.plan.findFirst({
      where: { id, userId: ctx.auth.user.id },
    })

    if (!plan) {
      throw new NotFoundError("Plan not found")
    }

    const updatedPlan = await ctx.db.plan.update({
      where: { id },
      // The fields are optional but non-nullable. No option for this in Nexus, so strip null values here
      data: omitBy(updateData, isNil),
    })

    return updatedPlan
  },
})

export const deletePlan = mutationField("deletePlan", {
  type: "Plan",
  args: { id: nonNull(intArg()) },
  resolve: async (_root, { id }: { id: number }, ctx) => {
    const plan = await ctx.db.plan.findFirst({
      where: { id, userId: ctx.auth.user.id },
    })

    if (!plan) {
      throw new NotFoundError("Plan not found")
    }

    const deletedPlan = await ctx.db.plan.delete({
      where: { id },
    })

    return deletedPlan
  },
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

    t.field("plan", {
      type: "Plan",
      resolve: ({ id }, _args, ctx) =>
        ctx.db.meal.findUnique({ where: { id } }).plan(),
    })
  },
})
