/*
  Warnings:

  - Added the required column `gender` to the `candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `reimbursement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "genderDbEnum" AS ENUM ('male', 'female', 'other');

-- AlterTable
ALTER TABLE "candidate" ADD COLUMN     "gender" "genderDbEnum" NOT NULL;

-- AlterTable
ALTER TABLE "reimbursement" ADD COLUMN     "date" DATE NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gender" "genderDbEnum" NOT NULL;
