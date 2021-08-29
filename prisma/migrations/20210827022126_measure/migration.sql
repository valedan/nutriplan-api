/*
  Warnings:

  - You are about to drop the column `measure` on the `Portion` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Portion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `measure_unit` to the `Portion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Portion" DROP COLUMN "measure",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "measure_unit" TEXT NOT NULL,
ADD COLUMN     "modifier" TEXT,
ADD COLUMN     "portion_description" TEXT;
