import {
  objectType,
  nonNull,
  list,
  mutationField,
  inputObjectType,
} from "nexus"
// import TargetService from "../services/nutrient/targets"

export const UpdateTargetInput = inputObjectType({
  name: "UpdateTargetInput",
  definition(t) {
    t.nonNull.int("id")
    t.float("min")
    t.float("max")
  },
})

// export const updateTarget = mutationField("updateTarget", {
//   type: "NutrientTarget",
//   args: { input: nonNull(UpdateTargetInput) },
//   // resolve: (_root, { input }, ctx) => TargetService.updateTarget(input, ctx),
// })

export const NutrientTarget = objectType({
  name: "NutrientTarget",
  definition(t) {
    t.nonNull.int("id")
    t.nonNull.datetime("createdAt")
    t.nonNull.datetime("updatedAt")
    t.float("min")
    t.float("max")

    t.field("nutrient", {
      type: nonNull("Nutrient"),
      resolve: async ({ id }, _args, ctx) => {
        const nutrient = await ctx.db.nutrientTarget
          .findUnique({ where: { id } })
          .nutrient()

        if (!nutrient) {
          throw new Error("Nutrient not found")
        }

        return nutrient
      },
    })
  },
})
