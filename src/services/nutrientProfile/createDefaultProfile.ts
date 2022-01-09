import { PrismaClient } from "@prisma/client"
import { NutrientProfile } from ".prisma/client"

// These are very rough and need solid research to pin down
const defaultTargets = {
  1008: {
    name: "Calories",
    unit: "kcal",
    min: 2300,
    max: 2700,
  },
  // TODO: DRI for fat is usually given as a percentage of total calories
  1004: {
    name: "Fat",
    min: 50,
    max: 80,
  },
  1005: {
    name: "Carbohydrates",
    min: 250,
    max: 350,
  },
  1003: {
    name: "Protein",
    min: 56,
    max: 70,
  },
  1079: {
    name: "Fiber",
    min: 30,
    max: 38,
  },
  // TODO: Vitamin A is calculated in a super complicated way with RAE. Research more.
  1104: {
    name: "Vitamin A",
    min: 3000,
    max: 9000,
  },
  1162: {
    name: "Vitamin C",
    min: 90,
    max: 2000,
  },
  1110: {
    name: "Vitamin D",
    min: 600,
    max: 4000,
  },
  1109: {
    name: "Vitamin E",
    min: 15,
    max: 1000,
  },
  1185: {
    name: "Vitamin K",
    min: 120,
    max: null,
  },
  1180: {
    name: "Choline",
    min: 550,
    max: 3500,
  },
  1165: {
    name: "B1 (Thiamine)",
    min: 1.2,
    max: null,
  },
  1166: {
    name: "B2 (Riboflavin)",
    min: 1.3,
    max: null,
  },
  1167: {
    name: "B3 (Niacin)",
    min: 16,
    max: 35, // Only for synthetic forms
  },
  1170: {
    name: "B5 (Pantothenic acid)",
    min: 5,
    max: null,
  },
  1175: {
    name: "B6 (Pyridoxine)",
    min: 1.3,
    max: 100,
  },
  1176: {
    name: "B7 (Biotin)",
    min: 30,
    max: null,
  },
  // TODO: research  this more - folate and folic acid both in db
  1177: {
    name: "B9 (Folate)",
    min: 400,
    max: 1000,
  },
  1178: {
    name: "B12 (Cobalamin)",
    min: 2.4,
    max: null,
  },
  1087: {
    name: "Calcium",
    min: 1000,
    max: 2500,
  },
  1098: {
    name: "Copper",
    min: 0.9,
    max: 10,
  },
  1089: {
    name: "Iron",
    min: 8,
    max: 45,
  },
  1090: {
    name: "Magnesium",
    min: 420,
    // TODO: There is an upper limit specifically for supplemental magnesium.
    // Add feature to detect supplements in plan and check if they're too high?
    max: null,
  },
  1101: {
    name: "Manganese",
    min: 2.3,
    max: 11,
  },
  1091: {
    name: "Phosphorus",
    min: 700,
    max: 4000,
  },
  1092: {
    name: "Potassium",
    min: 3400,
    max: null,
  },
  1103: {
    name: "Selenium",
    min: 55,
    max: 400,
  },
  1093: {
    name: "Sodium",
    min: 500,
    // This is nuanced - 2300 is the current RDA, but the AHA says an ideal limit would be 1500.
    max: 2300,
  },
  1095: {
    name: "Zinc",
    min: 11,
    max: 40,
  },
  // TODO: this should be percentages of fat, or maybe calories
  // These numbers are BS
  1292: {
    name: "Monounsaturated",
    min: 30,
    max: 50,
  },
  1293: {
    name: "Polyunsaturated",
    min: 15,
    max: 30,
  },
  1258: {
    name: "Saturated",
    min: 5,
    max: 15,
  },
  1257: {
    name: "Trans-Fat",
    min: null,
    max: 2,
  },
  // No guidelines for cholesterol because dietary doesn't translate to blood levels
  // Recommended to limit LDL in favor of HDL, but that data is not in USDA dataset
  1253: {
    name: "Cholesterol",
    min: null,
    max: null,
  },
  // TODO: research different carbs more
  1009: {
    name: "Starch",
    min: null,
    max: null,
  },
  1063: {
    name: "Sugars",
    min: null,
    max: null,
  },
  1012: {
    name: "Fructose",
    min: null,
    max: null,
  },
  // TODO: Amino acid rda's are given per kilo of bodyweight. need to get user's weight
  // RDA for methionine + cystine is usually combined, as methionine can produce cystine
  // This is also true for Phenylalanine + tyrosine
  // "In a diet low in tyrosine, as much as half the ingested phenylalanine may be converted to tyrosine in the body. Conversely, if the diet is rich in tyrosine, the requirement for phenylalanine could be reduced by 50%"
  // For now I'm giving each of the pair members half the AI of the whole pair
  1216: {
    name: "Cystine",
    min: 0.7,
    max: null,
  },
  1221: {
    name: "Histidine",
    min: 1,
    max: null,
  },
  1212: {
    name: "Isoleucine",
    min: 1.3,
    max: null,
  },
  1213: {
    name: "Leucine",
    min: 3,
    max: null,
  },
  1214: {
    name: "Lysine",
    min: 2.7,
    max: null,
  },
  1215: {
    name: "Methionine",
    min: 0.7,
    max: null,
  },
  1217: {
    name: "Phenylalanine",
    min: 1.15,
    max: null,
  },
  1211: {
    name: "Threonine",
    min: 1.4,
    max: null,
  },
  1210: {
    name: "Tryptophan",
    min: 0.35,
    max: null,
  },
  1218: {
    name: "Tyrosine",
    min: 1.15,
    max: null,
  },
  1219: {
    name: "Valine",
    min: 1.7,
    max: null,
  },
  1108: {
    name: "Alpha-carotene",
    min: null,
    max: null,
  },
  1107: {
    name: "Beta-carotene",
    min: null,
    max: null,
  },
  1105: {
    name: "Retinol",
    min: null,
    max: null,
  },
}

const createDefaultProfile = async (
  userId: string,
  db: PrismaClient
): Promise<NutrientProfile> => {
  // TODO: Handle case where user already has an active profile
  const newProfile = await db.nutrientProfile.create({
    data: {
      userId,
      isActive: true,
      name: "Standard",
    },
  })

  const targetData = Object.entries(defaultTargets).map(
    ([nutrientId, target]) => ({
      nutrientProfileId: newProfile.id,
      nutrientId: Number(nutrientId),
      min: target.min,
      max: target.max,
    })
  )

  try {
    await db.nutrientTarget.createMany({ data: targetData })
  } catch (e) {
    console.log(e)
  }

  // I just created this profile, I know that it is not null
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (await db.nutrientProfile.findUnique({
    where: { id: newProfile.id },
    include: {
      nutrientTargets: true,
    },
  }))!
}

export default createDefaultProfile
