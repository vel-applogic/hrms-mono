/*
  Warnings:

  - A unique constraint covering the columns `[email,organization_id]` on the table `candidate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organization_id` to the `candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `employee_compensation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `leave` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `leave_config` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `user_employee_deduction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `user_employee_feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `user_employee_leave_counter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "candidate" ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "employee_compensation" ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "leave" ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "leave_config" ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "payslip" ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "policy" ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user_employee_deduction" ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user_employee_feedback" ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user_employee_leave_counter" ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "candidate_organization_id_idx" ON "candidate"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_email_organization_id_key" ON "candidate"("email", "organization_id");

-- AddForeignKey
ALTER TABLE "employee_compensation" ADD CONSTRAINT "employee_compensation_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_deduction" ADD CONSTRAINT "user_employee_deduction_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip" ADD CONSTRAINT "payslip_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_feedback" ADD CONSTRAINT "user_employee_feedback_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_leave_counter" ADD CONSTRAINT "user_employee_leave_counter_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_config" ADD CONSTRAINT "leave_config_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave" ADD CONSTRAINT "leave_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy" ADD CONSTRAINT "policy_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
