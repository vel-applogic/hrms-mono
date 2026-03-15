-- AlterTable
ALTER TABLE "employee_salary" ALTER COLUMN "effective_from" DROP DEFAULT;

-- CreateTable
CREATE TABLE "leave_has_media" (
    "id" SERIAL NOT NULL,
    "leave_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_has_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leave_has_media_leave_id_idx" ON "leave_has_media"("leave_id");

-- CreateIndex
CREATE INDEX "leave_has_media_media_id_idx" ON "leave_has_media"("media_id");

-- AddForeignKey
ALTER TABLE "leave_has_media" ADD CONSTRAINT "leave_has_media_leave_id_fkey" FOREIGN KEY ("leave_id") REFERENCES "leave"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_has_media" ADD CONSTRAINT "leave_has_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
