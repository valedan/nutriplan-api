-- CreateEnum
CREATE TYPE "ServingSizeUnit" AS ENUM ('g', 'ml');

-- CreateEnum
CREATE TYPE "NutrientUnit" AS ENUM ('G', 'KCAL', 'MG', 'kJ', 'SP_GR', 'UG', 'IU', 'MG_ATE');

-- CreateTable
CREATE TABLE "Food" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "data_source" TEXT NOT NULL,
    "description" TEXT,
    "additional_descriptions" TEXT[],
    "category" TEXT,
    "brand" TEXT,
    "gtin_upc" TEXT,
    "ingredients" TEXT,
    "serving_size" DOUBLE PRECISION,
    "serving_size_unit" "ServingSizeUnit",
    "serving_size_description" TEXT,
    "common_names" TEXT,
    "barcode" TEXT,
    "doi" TEXT,
    "protein_calorie_conversion_factor" DOUBLE PRECISION,
    "fat_calorie_conversion_factor" DOUBLE PRECISION,
    "carbohydrate_conversion_factor" DOUBLE PRECISION,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portion" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "food_id" INTEGER NOT NULL,
    "sequence_number" INTEGER NOT NULL DEFAULT 1,
    "measure" TEXT NOT NULL,
    "gram_weight" DOUBLE PRECISION NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nutrient" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "unit" "NutrientUnit" NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodNutrient" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "food_id" INTEGER NOT NULL,
    "nutrient_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Food.description_index" ON "Food"("description");

-- CreateIndex
CREATE INDEX "Portion.food_id_index" ON "Portion"("food_id");

-- CreateIndex
CREATE INDEX "FoodNutrient.food_id_index" ON "FoodNutrient"("food_id");

-- CreateIndex
CREATE INDEX "FoodNutrient.nutrient_id_index" ON "FoodNutrient"("nutrient_id");

-- AddForeignKey
ALTER TABLE "Portion" ADD FOREIGN KEY ("food_id") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodNutrient" ADD FOREIGN KEY ("food_id") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodNutrient" ADD FOREIGN KEY ("nutrient_id") REFERENCES "Nutrient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
