/*
  Warnings:

  - A unique constraint covering the columns `[pan,organization_id]` on the table `user_employee_detail` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[aadhaar,organization_id]` on the table `user_employee_detail` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "user_employee_detail_aadhaar_key";

-- DropIndex
DROP INDEX "user_employee_detail_pan_key";

-- CreateIndex
CREATE UNIQUE INDEX "user_employee_detail_pan_organization_id_key" ON "user_employee_detail"("pan", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_employee_detail_aadhaar_organization_id_key" ON "user_employee_detail"("aadhaar", "organization_id");
