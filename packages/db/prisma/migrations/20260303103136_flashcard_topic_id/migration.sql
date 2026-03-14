/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `topic_id` to the `flashcard` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "userRoleDbEnum" AS ENUM ('admin', 'user');

-- AlterTable
ALTER TABLE "flashcard" ADD COLUMN     "topic_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "userRoleDbEnum" NOT NULL DEFAULT 'user';

-- DropEnum
DROP TYPE "UserRole";

-- AddForeignKey
ALTER TABLE "flashcard" ADD CONSTRAINT "flashcard_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
