/*
  Warnings:

  - You are about to drop the column `specific_month` on the `user_employee_deduction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payroll_deduction_line_item" ADD COLUMN     "specific_month" DATE;

-- AlterTable
ALTER TABLE "user_employee_deduction" DROP COLUMN "specific_month";
