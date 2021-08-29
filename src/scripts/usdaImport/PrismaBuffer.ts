import {
  Food,
  Nutrient,
  FoodNutrient,
  Portion,
  PrismaClient,
} from "@prisma/client"

class PrismaBuffer {
  buffer: (Food | Nutrient | FoodNutrient | Portion)[] = []

  bufferSize: number

  prisma: PrismaClient

  tableName: "food" | "nutrient" | "food_nutrient" | "portion"

  constructor(
    prisma: PrismaClient,
    tableName: "food" | "nutrient" | "food_nutrient" | "portion",
    bufferSize = 1000
  ) {
    this.prisma = prisma
    this.bufferSize = bufferSize
    this.tableName = tableName
    this.buffer = []
  }

  async create(data: Food | Nutrient | FoodNutrient | Portion): Promise<void> {
    this.buffer.push(data)
    if (this.buffer.length > this.bufferSize) {
      await this.flush()
    }
  }

  async flush(): Promise<void> {
    if (this.tableName === "food") {
      await this.prisma.food.createMany({ data: this.buffer as Food[] })
    } else if (this.tableName === "nutrient") {
      await this.prisma.nutrient.createMany({ data: this.buffer as Nutrient[] })
    } else if (this.tableName === "food_nutrient") {
      await this.prisma.foodNutrient.createMany({
        data: this.buffer as FoodNutrient[],
      })
    } else if (this.tableName === "portion") {
      // Seems like a bug with the linter here - it thinks portion is `any`
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await this.prisma.portion.createMany({ data: this.buffer as Portion[] })
    }
    this.buffer = []
  }
}

export default PrismaBuffer
