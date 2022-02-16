-- AlterTable
ALTER TABLE "Nutrient" ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "nutrientGroupId" INTEGER,
ADD COLUMN     "order" INTEGER;

-- CreateTable
CREATE TABLE "NutrientGroup" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "NutrientGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Nutrient" ADD CONSTRAINT "Nutrient_nutrientGroupId_fkey" FOREIGN KEY ("nutrientGroupId") REFERENCES "NutrientGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
