/*
  Warnings:

  - You are about to drop the column `basic` on the `employee_compensation` table. All the data in the column will be lost.
  - You are about to drop the column `gross` on the `employee_compensation` table. All the data in the column will be lost.
  - You are about to drop the column `hra` on the `employee_compensation` table. All the data in the column will be lost.
  - You are about to drop the column `other_allowances` on the `employee_compensation` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `user_employee_deduction` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `user_employee_deduction` table. All the data in the column will be lost.
  - You are about to drop the column `other_title` on the `user_employee_deduction` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `user_employee_deduction` table. All the data in the column will be lost.
  - Added the required column `gross_amount` to the `employee_compensation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "employee_compensation" DROP COLUMN "basic",
DROP COLUMN "gross",
DROP COLUMN "hra",
DROP COLUMN "other_allowances",
ADD COLUMN     "gross_amount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "user_employee_deduction" DROP COLUMN "amount",
DROP COLUMN "frequency",
DROP COLUMN "other_title",
DROP COLUMN "type";

-- CreateTable
CREATE TABLE "payroll_compensation_line_item" (
    "id" SERIAL NOT NULL,
    "payroll_compensation_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_compensation_line_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_deduction_line_item" (
    "id" SERIAL NOT NULL,
    "payroll_deduction_id" INTEGER NOT NULL,
    "type" "userEmployeeDeductionType" NOT NULL,
    "frequency" "userEmployeeDeductionFrequency" NOT NULL,
    "amount" INTEGER NOT NULL,
    "other_title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_deduction_line_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payroll_deduction_line_item_payroll_deduction_id_type_frequ_key" ON "payroll_deduction_line_item"("payroll_deduction_id", "type", "frequency");

-- AddForeignKey
ALTER TABLE "payroll_compensation_line_item" ADD CONSTRAINT "payroll_compensation_line_item_payroll_compensation_id_fkey" FOREIGN KEY ("payroll_compensation_id") REFERENCES "employee_compensation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_deduction_line_item" ADD CONSTRAINT "payroll_deduction_line_item_payroll_deduction_id_fkey" FOREIGN KEY ("payroll_deduction_id") REFERENCES "user_employee_deduction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
