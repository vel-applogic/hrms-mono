/*
  Warnings:

  - You are about to drop the column `type` on the `plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plan" DROP COLUMN "type";

-- DropEnum
DROP TYPE "PlanTypeEnum";
