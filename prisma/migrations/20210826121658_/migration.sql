/*
  Warnings:

  - You are about to drop the column `brand` on the `Food` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Food" DROP COLUMN "brand",
ADD COLUMN     "brand_name" TEXT,
ADD COLUMN     "brand_owner" TEXT,
ADD COLUMN     "not_a_significant_source_of" TEXT,
ADD COLUMN     "subbrand_name" TEXT;
