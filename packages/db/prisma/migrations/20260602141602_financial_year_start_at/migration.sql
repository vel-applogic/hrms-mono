/*
  Warnings:

  - You are about to drop the `OrganisationFinancialYear` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrganisationFinancialYear" DROP CONSTRAINT "OrganisationFinancialYear_organisation_id_fkey";

-- AlterTable
ALTER TABLE "organisation_settings" ADD COLUMN     "financial_year_starts_at" INTEGER NOT NULL DEFAULT 4;

-- DropTable
DROP TABLE "OrganisationFinancialYear";
