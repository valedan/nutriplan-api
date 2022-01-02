import { NutrientProfile, Prisma } from ".prisma/client"
import db from "../../src/config/db"

type NutrientProfileFactoryInput = Partial<NutrientProfile> & {
  userId: string
}

const profileBaseData = (): Omit<
  Prisma.NutrientProfileUncheckedCreateInput,
  "userId"
> => ({
  isActive: true,
  name: "Default profile",
})

export const createNutrientProfile = (
  data: NutrientProfileFactoryInput
): Prisma.Prisma__NutrientProfileClient<NutrientProfile> =>
  db.nutrientProfile.create({
    data: {
      ...profileBaseData(),
      ...data,
    },
  })
