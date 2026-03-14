-- AlterTable
ALTER TABLE "question" ADD COLUMN     "mediaId" INTEGER;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
