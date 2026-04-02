-- CreateTable
CREATE TABLE "employee_bgv_feedback" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_bgv_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_bgv_feedback_has_media" (
    "id" SERIAL NOT NULL,
    "employee_bgv_feedback_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_bgv_feedback_has_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employee_bgv_feedback_user_id_idx" ON "employee_bgv_feedback"("user_id");

-- CreateIndex
CREATE INDEX "employee_bgv_feedback_has_media_employee_bgv_feedback_id_idx" ON "employee_bgv_feedback_has_media"("employee_bgv_feedback_id");

-- CreateIndex
CREATE INDEX "employee_bgv_feedback_has_media_media_id_idx" ON "employee_bgv_feedback_has_media"("media_id");

-- AddForeignKey
ALTER TABLE "employee_bgv_feedback" ADD CONSTRAINT "employee_bgv_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_bgv_feedback" ADD CONSTRAINT "employee_bgv_feedback_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_bgv_feedback_has_media" ADD CONSTRAINT "employee_bgv_feedback_has_media_employee_bgv_feedback_id_fkey" FOREIGN KEY ("employee_bgv_feedback_id") REFERENCES "employee_bgv_feedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_bgv_feedback_has_media" ADD CONSTRAINT "employee_bgv_feedback_has_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
