/*
  Warnings:

  - You are about to drop the column `media_id` on the `slide` table. All the data in the column will be lost.
  - Changed the type of `content` on the `slide` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "slide" DROP CONSTRAINT "slide_media_id_fkey";

-- AlterTable
ALTER TABLE "slide" DROP COLUMN "media_id",
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;
