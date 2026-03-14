-- CreateEnum
CREATE TYPE "mediaTypeDbEnum" AS ENUM ('doc', 'image', 'zip', 'video');

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "thumbnail_key" TEXT,
    "type" "mediaTypeDbEnum" NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "ext" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theme" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard" (
    "id" SERIAL NOT NULL,
    "contentFront" TEXT NOT NULL,
    "contentBack" TEXT NOT NULL,
    "chapterId" INTEGER,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapter" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "mediaId" INTEGER,
    "description" TEXT,
    "summaryPoints" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "mediaId" INTEGER,
    "chapterId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slide" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "mediaId" INTEGER,
    "tags" TEXT[],
    "topicId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slide_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "flashcard" ADD CONSTRAINT "flashcard_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter" ADD CONSTRAINT "chapter_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic" ADD CONSTRAINT "topic_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic" ADD CONSTRAINT "topic_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slide" ADD CONSTRAINT "slide_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slide" ADD CONSTRAINT "slide_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
