-- AlterTable
ALTER TABLE "Food" ADD COLUMN     "fdc_available_date" TIMESTAMP(3),
ADD COLUMN     "fdc_data_source" TEXT,
ADD COLUMN     "fdc_modified_date" TIMESTAMP(3);
