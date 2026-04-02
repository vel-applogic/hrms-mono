/*
  Warnings:

  - You are about to drop the `leave_config` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "leave_config" DROP CONSTRAINT "leave_config_organization_id_fkey";

-- AlterTable
ALTER TABLE "user_employee_detail" ADD COLUMN     "is_bg_verified" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "leave_config";
