/*
  Warnings:

  - Added the required column `currency_id` to the `organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "currency_id" INTEGER NOT NULL,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "currency" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT,

    CONSTRAINT "currency_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


