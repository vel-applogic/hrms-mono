/*
  Warnings:

  - You are about to drop the `plan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_has_plan` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PlanEnum" AS ENUM ('free', 'premium');

-- DropForeignKey
ALTER TABLE "user_has_plan" DROP CONSTRAINT "user_has_plan_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "user_has_plan" DROP CONSTRAINT "user_has_plan_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "plan" "PlanEnum" NOT NULL DEFAULT 'free';

-- DropTable
DROP TABLE "plan";

-- DropTable
DROP TABLE "user_has_plan";

-- CreateTable
CREATE TABLE "user_plan_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plan" "PlanEnum" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_plan_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_plan_history" ADD CONSTRAINT "user_plan_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
