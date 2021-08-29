/*
  Warnings:

  - Added the required column `nutrient_number` to the `Nutrient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Nutrient" ADD COLUMN     "nutrient_number" INTEGER NOT NULL;
