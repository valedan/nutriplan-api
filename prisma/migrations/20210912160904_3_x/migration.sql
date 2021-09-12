-- DropForeignKey
ALTER TABLE "FoodNutrient" DROP CONSTRAINT "FoodNutrient_food_id_fkey";

-- DropForeignKey
ALTER TABLE "FoodNutrient" DROP CONSTRAINT "FoodNutrient_nutrient_id_fkey";

-- DropForeignKey
ALTER TABLE "Ingredient" DROP CONSTRAINT "Ingredient_foodId_fkey";

-- DropForeignKey
ALTER TABLE "Meal" DROP CONSTRAINT "Meal_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "Meal" DROP CONSTRAINT "Meal_recipe_id_fkey";

-- DropForeignKey
ALTER TABLE "Portion" DROP CONSTRAINT "Portion_food_id_fkey";

-- AddForeignKey
ALTER TABLE "Portion" ADD CONSTRAINT "Portion_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodNutrient" ADD CONSTRAINT "FoodNutrient_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodNutrient" ADD CONSTRAINT "FoodNutrient_nutrientId_fkey" FOREIGN KEY ("nutrientId") REFERENCES "Nutrient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Food.description_index" RENAME TO "Food_description_idx";

-- RenameIndex
ALTER INDEX "Food.gtinUpc_index" RENAME TO "Food_gtinUpc_idx";

-- RenameIndex
ALTER INDEX "FoodNutrient.foodId_index" RENAME TO "FoodNutrient_foodId_idx";

-- RenameIndex
ALTER INDEX "FoodNutrient.nutrientId_index" RENAME TO "FoodNutrient_nutrientId_idx";

-- RenameIndex
ALTER INDEX "Plan.userId_index" RENAME TO "Plan_userId_idx";

-- RenameIndex
ALTER INDEX "Portion.foodId_index" RENAME TO "Portion_foodId_idx";
