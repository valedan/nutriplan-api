-- CreateTable
CREATE TABLE "NutrientProfile" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NutrientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutrientTarget" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nutrientProfileId" INTEGER NOT NULL,
    "nutrientId" INTEGER NOT NULL,
    "min" DOUBLE PRECISION NOT NULL,
    "max" DOUBLE PRECISION NOT NULL,
    "unit" "NutrientUnit" NOT NULL,

    CONSTRAINT "NutrientTarget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NutrientProfile_userId_idx" ON "NutrientProfile"("userId");

-- AddForeignKey
ALTER TABLE "NutrientTarget" ADD CONSTRAINT "NutrientTarget_nutrientProfileId_fkey" FOREIGN KEY ("nutrientProfileId") REFERENCES "NutrientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutrientTarget" ADD CONSTRAINT "NutrientTarget_nutrientId_fkey" FOREIGN KEY ("nutrientId") REFERENCES "Nutrient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
