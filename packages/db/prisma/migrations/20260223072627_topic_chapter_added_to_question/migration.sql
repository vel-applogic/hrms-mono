/*
  Warnings:

  - You are about to drop the column `created_at` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `media` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chapterId` to the `question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topicId` to the `question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "media" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "question" ADD COLUMN     "chapterId" INTEGER NOT NULL,
ADD COLUMN     "topicId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
