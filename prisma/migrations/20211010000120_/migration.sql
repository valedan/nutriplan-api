/*
  Warnings:

  - Made the column `nutrientCount` on table `Food` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Food" ALTER COLUMN "nutrientCount" SET NOT NULL,
ALTER COLUMN "nutrientCount" SET DEFAULT 0;
