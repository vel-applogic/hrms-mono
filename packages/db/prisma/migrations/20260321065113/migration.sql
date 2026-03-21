/*
  Warnings:

  - You are about to alter the column `basic` on the `employee_compensation` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `hra` on the `employee_compensation` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `other_allowances` on the `employee_compensation` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `gross` on the `employee_compensation` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- CreateEnum
CREATE TYPE "userEmployeeDeductionType" AS ENUM ('providentFund', 'incomeTax', 'insurance', 'professionalTax', 'loan', 'other');

-- CreateEnum
CREATE TYPE "userEmployeeDeductionFrequency" AS ENUM ('monthly', 'yearly', 'specificMonth');

-- AlterTable
ALTER TABLE "employee_compensation" ALTER COLUMN "basic" SET DATA TYPE INTEGER,
ALTER COLUMN "hra" SET DATA TYPE INTEGER,
ALTER COLUMN "other_allowances" SET DATA TYPE INTEGER,
ALTER COLUMN "gross" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "user_employee_deduction" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "userEmployeeDeductionType" NOT NULL,
    "frequency" "userEmployeeDeductionFrequency" NOT NULL,
    "amount" INTEGER NOT NULL,
    "other_title" TEXT,
    "effective_from" DATE NOT NULL,
    "effective_till" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_employee_deduction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_employee_deduction_user_id_idx" ON "user_employee_deduction"("user_id");

-- AddForeignKey
ALTER TABLE "user_employee_deduction" ADD CONSTRAINT "user_employee_deduction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
