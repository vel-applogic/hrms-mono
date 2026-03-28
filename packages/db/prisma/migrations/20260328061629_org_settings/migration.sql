-- CreateEnum
CREATE TYPE "NoOfDaysInMonthDbEnum" AS ENUM ('dynamic', 'thirty', 'thirtyOne');

-- CreateTable
CREATE TABLE "organization_settings" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "logo_id" INTEGER NOT NULL,
    "no_of_days_in_month" "NoOfDaysInMonthDbEnum" NOT NULL DEFAULT 'thirty',
    "total_leave_in_days" INTEGER NOT NULL DEFAULT 24,
    "sick_leave_in_days" INTEGER NOT NULL DEFAULT 10,
    "earned_leave_in_days" INTEGER NOT NULL DEFAULT 10,
    "casual_leave_in_days" INTEGER NOT NULL DEFAULT 10,
    "maternity_leave_in_days" INTEGER NOT NULL DEFAULT 10,
    "paternity_leave_in_days" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_has_document" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "document_id" INTEGER NOT NULL,
    "media_type" "mediaTypeDbEnum" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_has_document_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_logo_id_fkey" FOREIGN KEY ("logo_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_has_document" ADD CONSTRAINT "organization_has_document_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_has_document" ADD CONSTRAINT "organization_has_document_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
