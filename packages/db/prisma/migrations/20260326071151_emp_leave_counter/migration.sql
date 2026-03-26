/*
  Warnings:

  - A unique constraint covering the columns `[user_id,organization_id,financial_year]` on the table `user_employee_leave_counter` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "user_employee_leave_counter_user_id_financial_year_key";

-- DropIndex
DROP INDEX "user_employee_leave_counter_user_id_idx";

-- CreateIndex
CREATE INDEX "user_employee_leave_counter_user_id_organization_id_idx" ON "user_employee_leave_counter"("user_id", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_employee_leave_counter_user_id_organization_id_financi_key" ON "user_employee_leave_counter"("user_id", "organization_id", "financial_year");
