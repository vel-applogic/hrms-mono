-- CreateEnum
CREATE TYPE "holidayType" AS ENUM ('national', 'state');

-- AlterTable
ALTER TABLE "holiday" ADD COLUMN     "types" "holidayType"[];
