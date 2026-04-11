/*
  Warnings:

  - Added the required column `emergency_contact_name` to the `user_employee_detail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergency_contact_number` to the `user_employee_detail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergency_contact_relationship` to the `user_employee_detail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_employee_detail" ADD COLUMN     "emergency_contact_name" TEXT NOT NULL,
ADD COLUMN     "emergency_contact_number" TEXT NOT NULL,
ADD COLUMN     "emergency_contact_relationship" TEXT NOT NULL;
