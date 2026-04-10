-- CreateEnum
CREATE TYPE "reimbursementStatusDbEnum" AS ENUM ('pending', 'approved', 'paid', 'rejected');

-- CreateTable
CREATE TABLE "reimbursement" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "reimbursementStatusDbEnum" NOT NULL DEFAULT 'pending',
    "reject_reason" TEXT,
    "approved_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reimbursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reimbursement_has_media" (
    "id" SERIAL NOT NULL,
    "reimbursement_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reimbursement_has_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reimbursement_has_feedback" (
    "id" SERIAL NOT NULL,
    "reimbursement_id" INTEGER NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reimbursement_has_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reimbursement_organization_id_idx" ON "reimbursement"("organization_id");

-- CreateIndex
CREATE INDEX "reimbursement_user_id_idx" ON "reimbursement"("user_id");

-- CreateIndex
CREATE INDEX "reimbursement_has_media_reimbursement_id_idx" ON "reimbursement_has_media"("reimbursement_id");

-- CreateIndex
CREATE INDEX "reimbursement_has_media_media_id_idx" ON "reimbursement_has_media"("media_id");

-- CreateIndex
CREATE INDEX "reimbursement_has_feedback_reimbursement_id_idx" ON "reimbursement_has_feedback"("reimbursement_id");

-- AddForeignKey
ALTER TABLE "reimbursement" ADD CONSTRAINT "reimbursement_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reimbursement" ADD CONSTRAINT "reimbursement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reimbursement_has_media" ADD CONSTRAINT "reimbursement_has_media_reimbursement_id_fkey" FOREIGN KEY ("reimbursement_id") REFERENCES "reimbursement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reimbursement_has_media" ADD CONSTRAINT "reimbursement_has_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reimbursement_has_feedback" ADD CONSTRAINT "reimbursement_has_feedback_reimbursement_id_fkey" FOREIGN KEY ("reimbursement_id") REFERENCES "reimbursement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reimbursement_has_feedback" ADD CONSTRAINT "reimbursement_has_feedback_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
