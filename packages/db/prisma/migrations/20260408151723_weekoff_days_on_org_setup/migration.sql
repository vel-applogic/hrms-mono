-- AlterTable
ALTER TABLE "organization_settings" ADD COLUMN     "weekly_off_days" INTEGER[] DEFAULT ARRAY[0, 6]::INTEGER[];
