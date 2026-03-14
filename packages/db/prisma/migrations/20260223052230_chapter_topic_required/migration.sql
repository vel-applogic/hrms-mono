/*
  Warnings:

  - Made the column `chapterId` on table `flashcard` required. This step will fail if there are existing NULL values in that column.
  - Made the column `chapterId` on table `topic` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "flashcard" DROP CONSTRAINT "flashcard_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "topic" DROP CONSTRAINT "topic_chapterId_fkey";

-- AlterTable
ALTER TABLE "flashcard" ALTER COLUMN "chapterId" SET NOT NULL;

-- AlterTable
ALTER TABLE "topic" ALTER COLUMN "chapterId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "topic" ADD CONSTRAINT "topic_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard" ADD CONSTRAINT "flashcard_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
