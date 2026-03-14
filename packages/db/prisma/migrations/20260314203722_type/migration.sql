/*
  Warnings:

  - The values [document] on the enum `employeeMediaType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "employeeMediaType_new" AS ENUM ('photo', 'resume', 'offerLetter', 'otherDocuments');
ALTER TABLE "employee_has_media" ALTER COLUMN "type" TYPE "employeeMediaType_new" USING ("type"::text::"employeeMediaType_new");
ALTER TYPE "employeeMediaType" RENAME TO "employeeMediaType_old";
ALTER TYPE "employeeMediaType_new" RENAME TO "employeeMediaType";
DROP TYPE "public"."employeeMediaType_old";
COMMIT;
