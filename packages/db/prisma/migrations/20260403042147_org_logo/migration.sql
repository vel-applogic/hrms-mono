/*
  Warnings:

  - You are about to drop the column `logo_id` on the `organization_settings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "organization_settings" DROP CONSTRAINT "organization_settings_logo_id_fkey";

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "logo_id" INTEGER;

-- AlterTable
ALTER TABLE "organization_settings" DROP COLUMN "logo_id";

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_logo_id_fkey" FOREIGN KEY ("logo_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
