ALTER TABLE "Ingredient"
DROP CONSTRAINT chk_one_parent_relation;

ALTER TABLE "Ingredient"
ADD CONSTRAINT chk_one_parent_relation CHECK (num_nonnulls("recipeId", "planId", "mealId") = 1);