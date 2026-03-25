/*
  Warnings:

  - A unique constraint covering the columns `[employee_code,organization_id]` on the table `user_employee_detail` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `employee_code` to the `user_employee_detail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_employee_detail" ADD COLUMN     "employee_code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_employee_detail_employee_code_organization_id_key" ON "user_employee_detail"("employee_code", "organization_id");
