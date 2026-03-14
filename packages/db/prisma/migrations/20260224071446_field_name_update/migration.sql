/*
  Warnings:

  - You are about to drop the column `createdAt` on the `chapter` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `chapter` table. All the data in the column will be lost.
  - You are about to drop the column `chapterId` on the `flashcard` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `flashcard` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `flashcard` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `flashcard_has_theme` table. All the data in the column will be lost.
  - You are about to drop the column `flashcardId` on the `flashcard_has_theme` table. All the data in the column will be lost.
  - You are about to drop the column `themeId` on the `flashcard_has_theme` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `flashcard_has_theme` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `answerOptions` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `chapterId` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `correctAnswerKeys` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `mediaId` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `question_has_theme` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `question_has_theme` table. All the data in the column will be lost.
  - You are about to drop the column `themeId` on the `question_has_theme` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `question_has_theme` table. All the data in the column will be lost.
  - You are about to drop the column `chapterId` on the `slide` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `slide` table. All the data in the column will be lost.
  - You are about to drop the column `mediaId` on the `slide` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `slide` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `slide` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `slide_has_theme` table. All the data in the column will be lost.
  - You are about to drop the column `slideId` on the `slide_has_theme` table. All the data in the column will be lost.
  - You are about to drop the column `themeId` on the `slide_has_theme` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `slide_has_theme` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `theme` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `theme` table. All the data in the column will be lost.
  - You are about to drop the column `chapterId` on the `topic` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `topic` table. All the data in the column will be lost.
  - You are about to drop the column `mediaId` on the `topic` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `topic` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `chapter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chapter_id` to the `flashcard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `flashcard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flashcard_id` to the `flashcard_has_theme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `theme_id` to the `flashcard_has_theme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `flashcard_has_theme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `answer_options` to the `question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chapter_id` to the `question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic_id` to the `question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_id` to the `question_has_theme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `theme_id` to the `question_has_theme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `question_has_theme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chapter_id` to the `slide` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic_id` to the `slide` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `slide` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slide_id` to the `slide_has_theme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `theme_id` to the `slide_has_theme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `slide_has_theme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `theme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chapter_id` to the `topic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `topic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "flashcard" DROP CONSTRAINT "flashcard_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "flashcard_has_theme" DROP CONSTRAINT "flashcard_has_theme_flashcardId_fkey";

-- DropForeignKey
ALTER TABLE "flashcard_has_theme" DROP CONSTRAINT "flashcard_has_theme_themeId_fkey";

-- DropForeignKey
ALTER TABLE "question" DROP CONSTRAINT "question_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "question" DROP CONSTRAINT "question_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "question" DROP CONSTRAINT "question_topicId_fkey";

-- DropForeignKey
ALTER TABLE "question_has_theme" DROP CONSTRAINT "question_has_theme_questionId_fkey";

-- DropForeignKey
ALTER TABLE "question_has_theme" DROP CONSTRAINT "question_has_theme_themeId_fkey";

-- DropForeignKey
ALTER TABLE "slide" DROP CONSTRAINT "slide_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "slide" DROP CONSTRAINT "slide_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "slide" DROP CONSTRAINT "slide_topicId_fkey";

-- DropForeignKey
ALTER TABLE "slide_has_theme" DROP CONSTRAINT "slide_has_theme_slideId_fkey";

-- DropForeignKey
ALTER TABLE "slide_has_theme" DROP CONSTRAINT "slide_has_theme_themeId_fkey";

-- DropForeignKey
ALTER TABLE "topic" DROP CONSTRAINT "topic_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "topic" DROP CONSTRAINT "topic_mediaId_fkey";

-- AlterTable
ALTER TABLE "chapter" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "flashcard" DROP COLUMN "chapterId",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "chapter_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "flashcard_has_theme" DROP COLUMN "createdAt",
DROP COLUMN "flashcardId",
DROP COLUMN "themeId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "flashcard_id" INTEGER NOT NULL,
ADD COLUMN     "theme_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "media" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "question" DROP COLUMN "answerOptions",
DROP COLUMN "chapterId",
DROP COLUMN "correctAnswerKeys",
DROP COLUMN "createdAt",
DROP COLUMN "mediaId",
DROP COLUMN "topicId",
DROP COLUMN "updatedAt",
ADD COLUMN     "answer_options" JSONB NOT NULL,
ADD COLUMN     "chapter_id" INTEGER NOT NULL,
ADD COLUMN     "correct_answer_keys" TEXT[],
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "media_id" INTEGER,
ADD COLUMN     "topic_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "question_has_theme" DROP COLUMN "createdAt",
DROP COLUMN "questionId",
DROP COLUMN "themeId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "question_id" INTEGER NOT NULL,
ADD COLUMN     "theme_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "slide" DROP COLUMN "chapterId",
DROP COLUMN "createdAt",
DROP COLUMN "mediaId",
DROP COLUMN "topicId",
DROP COLUMN "updatedAt",
ADD COLUMN     "chapter_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "media_id" INTEGER,
ADD COLUMN     "topic_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "slide_has_theme" DROP COLUMN "createdAt",
DROP COLUMN "slideId",
DROP COLUMN "themeId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "slide_id" INTEGER NOT NULL,
ADD COLUMN     "theme_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "theme" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "topic" DROP COLUMN "chapterId",
DROP COLUMN "createdAt",
DROP COLUMN "mediaId",
DROP COLUMN "updatedAt",
ADD COLUMN     "chapter_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "media_id" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "topic" ADD CONSTRAINT "topic_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic" ADD CONSTRAINT "topic_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slide" ADD CONSTRAINT "slide_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slide" ADD CONSTRAINT "slide_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slide" ADD CONSTRAINT "slide_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slide_has_theme" ADD CONSTRAINT "slide_has_theme_slide_id_fkey" FOREIGN KEY ("slide_id") REFERENCES "slide"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slide_has_theme" ADD CONSTRAINT "slide_has_theme_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard" ADD CONSTRAINT "flashcard_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_has_theme" ADD CONSTRAINT "flashcard_has_theme_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "flashcard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_has_theme" ADD CONSTRAINT "flashcard_has_theme_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_has_theme" ADD CONSTRAINT "question_has_theme_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_has_theme" ADD CONSTRAINT "question_has_theme_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
