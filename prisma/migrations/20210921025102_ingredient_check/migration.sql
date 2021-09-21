ALTER TABLE "Ingredient"
ADD CONSTRAINT chk_one_parent_relation CHECK (num_nonnulls("foodId", "planId", "mealId") = 1);