-- AlterIndex
ALTER INDEX "Food.gtin_upc_index" RENAME TO "Food.gtinUpc_index";

-- AlterIndex
ALTER INDEX "FoodNutrient.food_id_index" RENAME TO "FoodNutrient.foodId_index";

-- AlterIndex
ALTER INDEX "FoodNutrient.nutrient_id_index" RENAME TO "FoodNutrient.nutrientId_index";

-- AlterIndex
ALTER INDEX "Plan.user_id_index" RENAME TO "Plan.userId_index";

-- AlterIndex
ALTER INDEX "Portion.food_id_index" RENAME TO "Portion.foodId_index";
