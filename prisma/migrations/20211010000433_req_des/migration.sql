/*
  Warnings:

  - Made the column `description` on table `Food` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Food" ALTER COLUMN "description" SET NOT NULL;
