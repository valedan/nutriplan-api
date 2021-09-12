-- AlterTable
ALTER TABLE "Food"
RENAME COLUMN "additional_descriptions" TO "additionalDescriptions";

ALTER TABLE "Food"
RENAME COLUMN "brand_name" TO "brandName";

ALTER TABLE "Food"
RENAME COLUMN "brand_owner" TO "brandOwner";

ALTER TABLE "Food"
RENAME COLUMN "carbohydrate_conversion_factor" TO "carbohydrateConversionFactor";

ALTER TABLE "Food"
RENAME COLUMN "common_names" TO "commonNames";

ALTER TABLE "Food"
RENAME COLUMN "created_at" TO "createdAt";

ALTER TABLE "Food"
RENAME COLUMN "fat_calorie_conversion_factor" TO "fatCalorieConversionFactor";

ALTER TABLE "Food"
RENAME COLUMN "fdc_available_date" TO "fdcAvailableDate";

ALTER TABLE "Food"
RENAME COLUMN "fdc_data_source" TO "fdcDataSource";

ALTER TABLE "Food"
RENAME COLUMN "fdc_modified_date" TO "fdcModifiedDate";

ALTER TABLE "Food"
RENAME COLUMN "gtin_upc" TO "gtinUpc";

ALTER TABLE "Food"
RENAME COLUMN "in_elasticsearch" TO "inElasticsearch";

ALTER TABLE "Food"
RENAME COLUMN "not_a_significant_source_of" TO "notASignificantSourceOf";

ALTER TABLE "Food"
RENAME COLUMN "nutrient_count" TO "nutrientCount";

ALTER TABLE "Food"
RENAME COLUMN "protein_calorie_conversion_factor" TO "proteinCalorieConversionFactor";

ALTER TABLE "Food"
RENAME COLUMN "serving_size" TO "servingSize";

ALTER TABLE "Food"
RENAME COLUMN "serving_size_description" TO "servingSizeDescription";

ALTER TABLE "Food"
RENAME COLUMN "serving_size_unit" TO "servingSizeUnit";

ALTER TABLE "Food"
RENAME COLUMN "subbrand_name" TO "subbrandName";

ALTER TABLE "Food"
RENAME COLUMN "updated_at" TO "updatedAt";


-- AlterTable
ALTER TABLE "FoodNutrient"
RENAME COLUMN "created_at" TO "createdAt";

ALTER TABLE "FoodNutrient"
RENAME COLUMN "food_id" TO "foodId";

ALTER TABLE "FoodNutrient"
RENAME COLUMN "nutrient_id" TO "nutrientId";

ALTER TABLE "FoodNutrient"
RENAME COLUMN "updated_at" TO "updatedAt";


-- AlterTable
ALTER TABLE "Meal"
RENAME COLUMN "created_at" TO "createdAt";

ALTER TABLE "Meal"
RENAME COLUMN "plan_id" TO "planId";

ALTER TABLE "Meal"
RENAME COLUMN "recipe_id" TO "recipeId";

ALTER TABLE "Meal"
RENAME COLUMN "updated_at" TO "updatedAt";


-- AlterTable
ALTER TABLE "Nutrient"
RENAME COLUMN "created_at" TO "createdAt";

ALTER TABLE "Nutrient"
RENAME COLUMN "nutrient_number" TO "nutrientNumber";

ALTER TABLE "Nutrient"
RENAME COLUMN "updated_at" TO "updatedAt";


-- AlterTable
ALTER TABLE "Plan"
RENAME COLUMN "created_at" TO "createdAt";

ALTER TABLE "Plan"
RENAME COLUMN "end_date" TO "endDate";

ALTER TABLE "Plan"
RENAME COLUMN "start_date" TO "startDate";

ALTER TABLE "Plan"
RENAME COLUMN "updated_at" TO "updatedAt";

ALTER TABLE "Plan"
RENAME COLUMN "user_id" TO "userId";


-- AlterTable
ALTER TABLE "PlanIngredient"
RENAME COLUMN "created_at" TO "createdAt";

ALTER TABLE "PlanIngredient"
RENAME COLUMN "food_id" TO "foodId";

ALTER TABLE "PlanIngredient"
RENAME COLUMN "meal_id" TO "mealId";

ALTER TABLE "PlanIngredient"
RENAME COLUMN "plan_id" TO "planId";

ALTER TABLE "PlanIngredient"
RENAME COLUMN "updated_at" TO "updatedAt";


-- AlterTable
ALTER TABLE "Portion"
RENAME COLUMN "created_at" TO "createdAt";

ALTER TABLE "Portion"
RENAME COLUMN "food_id" TO "foodId";

ALTER TABLE "Portion"
RENAME COLUMN "gram_weight" TO "gramWeight";

ALTER TABLE "Portion"
RENAME COLUMN "measure_unit" TO "measureUnit";

ALTER TABLE "Portion"
RENAME COLUMN "portion_description" TO "portionDescription";

ALTER TABLE "Portion"
RENAME COLUMN "sequence_number" TO "sequenceNumber";

ALTER TABLE "Portion"
RENAME COLUMN "updated_at" TO "updatedAt";


-- AlterTable
ALTER TABLE "Recipe"
RENAME COLUMN "created_at" TO "createdAt";

ALTER TABLE "Recipe"
RENAME COLUMN "updated_at" TO "updatedAt";


-- AlterTable
ALTER TABLE "RecipeIngredient"
RENAME COLUMN "created_at" TO "createdAt";

ALTER TABLE "RecipeIngredient"
RENAME COLUMN "food_id" TO "foodId";

ALTER TABLE "RecipeIngredient"
RENAME COLUMN "recipe_id" TO "recipeId";

ALTER TABLE "RecipeIngredient"
RENAME COLUMN "updated_at" TO "updatedAt";

