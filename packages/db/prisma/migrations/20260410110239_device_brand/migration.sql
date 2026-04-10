/*
  Warnings:

  - Added the required column `brand` to the `device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "device" ADD COLUMN     "brand" TEXT NOT NULL;
