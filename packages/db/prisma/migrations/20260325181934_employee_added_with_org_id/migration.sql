/*
  Warnings:

  - A unique constraint covering the columns `[user_id,organization_id]` on the table `user_employee_detail` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organization_id` to the `user_employee_detail` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_employee_detail_user_id_key";

-- AlterTable
ALTER TABLE "user_employee_detail" ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_employee_detail_user_id_organization_id_key" ON "user_employee_detail"("user_id", "organization_id");

-- AddForeignKey
ALTER TABLE "user_employee_detail" ADD CONSTRAINT "user_employee_detail_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
