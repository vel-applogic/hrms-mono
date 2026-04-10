/*
  Warnings:

  - You are about to drop the `user_has_device` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_has_device" DROP CONSTRAINT "user_has_device_device_id_fkey";

-- DropForeignKey
ALTER TABLE "user_has_device" DROP CONSTRAINT "user_has_device_user_id_fkey";

-- AlterTable
ALTER TABLE "device" ADD COLUMN     "assigned_to_id" INTEGER;

-- DropTable
DROP TABLE "user_has_device";

-- CreateTable
CREATE TABLE "device_possession_history" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "device_id" INTEGER NOT NULL,
    "from_date" TIMESTAMP(3) NOT NULL,
    "to_date" TIMESTAMP(3),
    "notes" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_possession_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "device_possession_history_user_id_idx" ON "device_possession_history"("user_id");

-- CreateIndex
CREATE INDEX "device_possession_history_device_id_idx" ON "device_possession_history"("device_id");

-- CreateIndex
CREATE INDEX "device_possession_history_organization_id_idx" ON "device_possession_history"("organization_id");

-- AddForeignKey
ALTER TABLE "device_possession_history" ADD CONSTRAINT "device_possession_history_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_possession_history" ADD CONSTRAINT "device_possession_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_possession_history" ADD CONSTRAINT "device_possession_history_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device" ADD CONSTRAINT "device_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
