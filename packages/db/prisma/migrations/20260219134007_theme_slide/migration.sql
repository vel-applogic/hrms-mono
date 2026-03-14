/*
  Warnings:

  - You are about to drop the column `tags` on the `flashcard` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `slide` table. All the data in the column will be lost.
  - Added the required column `chapterId` to the `slide` table without a default value. This is not possible if the table is not empty.
  - Made the column `topicId` on table `slide` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "slide" DROP CONSTRAINT "slide_topicId_fkey";

-- AlterTable
ALTER TABLE "flashcard" DROP COLUMN "tags";

-- AlterTable
ALTER TABLE "slide" DROP COLUMN "tags",
ADD COLUMN     "chapterId" INTEGER NOT NULL,
ALTER COLUMN "topicId" SET NOT NULL;

-- CreateTable
CREATE TABLE "slide_has_theme" (
    "id" SERIAL NOT NULL,
    "slideId" INTEGER NOT NULL,
    "themeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slide_has_theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard_has_theme" (
    "id" SERIAL NOT NULL,
    "flashcardId" INTEGER NOT NULL,
    "themeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcard_has_theme_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "slide" ADD CONSTRAINT "slide_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slide" ADD CONSTRAINT "slide_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slide_has_theme" ADD CONSTRAINT "slide_has_theme_slideId_fkey" FOREIGN KEY ("slideId") REFERENCES "slide"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slide_has_theme" ADD CONSTRAINT "slide_has_theme_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_has_theme" ADD CONSTRAINT "flashcard_has_theme_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "flashcard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_has_theme" ADD CONSTRAINT "flashcard_has_theme_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
