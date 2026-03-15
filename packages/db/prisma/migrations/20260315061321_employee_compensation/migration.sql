/*
  Warnings:

  - You are about to drop the `employee_salary` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "employee_salary" DROP CONSTRAINT "employee_salary_user_id_fkey";

-- DropTable
DROP TABLE "employee_salary";

-- CreateTable
CREATE TABLE "employee_compensation" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "basic" DOUBLE PRECISION NOT NULL,
    "hra" DOUBLE PRECISION NOT NULL,
    "other_allowances" DOUBLE PRECISION NOT NULL,
    "gross" DOUBLE PRECISION NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_till" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_compensation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employee_compensation_user_id_idx" ON "employee_compensation"("user_id");

-- AddForeignKey
ALTER TABLE "employee_compensation" ADD CONSTRAINT "employee_compensation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
