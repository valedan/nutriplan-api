/*
  Warnings:

  - You are about to drop the column `ingredients` on the `Food` table. All the data in the column will be lost.
  - You are about to drop the `PlanIngredient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecipeIngredient` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlanIngredient" DROP CONSTRAINT "PlanIngredient_food_id_fkey";

-- DropForeignKey
ALTER TABLE "PlanIngredient" DROP CONSTRAINT "PlanIngredient_meal_id_fkey";

-- DropForeignKey
ALTER TABLE "PlanIngredient" DROP CONSTRAINT "PlanIngredient_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_food_id_fkey";

-- DropForeignKey
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_recipe_id_fkey";

-- AlterTable
ALTER TABLE "Food"
RENAME COLUMN "ingredients" TO "subIngredients";

-- DropTable
DROP TABLE "PlanIngredient";

-- DropTable
DROP TABLE "RecipeIngredient";

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "measure" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "foodId" INTEGER NOT NULL,
    "planId" INTEGER,
    "mealId" INTEGER,
    "recipeId" INTEGER,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ingredient" ADD FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;
