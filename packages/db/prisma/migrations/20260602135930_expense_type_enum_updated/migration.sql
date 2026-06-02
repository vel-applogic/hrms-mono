/*
  Warnings:

  - The values [salary] on the enum `expenseType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "expenseType_new" AS ENUM ('incomeTax', 'rent', 'ai', 'emailService', 'server', 'internet', 'phone', 'account', 'auditor', 'roc', 'digitalSignature', 'healthInsurance', 'accidentInsurance', 'travelInsurance', 'liabilityInsurance', 'propertyInsurance', 'other');
ALTER TABLE "expense" ALTER COLUMN "type" TYPE "expenseType_new" USING ("type"::text::"expenseType_new");
ALTER TABLE "expense_forecast" ALTER COLUMN "type" TYPE "expenseType_new" USING ("type"::text::"expenseType_new");
ALTER TYPE "expenseType" RENAME TO "expenseType_old";
ALTER TYPE "expenseType_new" RENAME TO "expenseType";
DROP TYPE "public"."expenseType_old";
COMMIT;
