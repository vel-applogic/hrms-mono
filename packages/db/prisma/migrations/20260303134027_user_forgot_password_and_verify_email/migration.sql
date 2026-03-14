-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "auditEventTypeDbEnum" ADD VALUE 'upgrade_plan';
ALTER TYPE "auditEventTypeDbEnum" ADD VALUE 'downgrade_plan';
ALTER TYPE "auditEventTypeDbEnum" ADD VALUE 'block_user';
ALTER TYPE "auditEventTypeDbEnum" ADD VALUE 'unblock_user';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "last_logged_in_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "user_forgot_password" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "forgot_password_key" TEXT,
    "forgot_password_key_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reset_at" TIMESTAMP(3),

    CONSTRAINT "user_forgot_password_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_verify_email" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "verify_email_key" TEXT,
    "verify_email_key_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),

    CONSTRAINT "user_verify_email_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_forgot_password" ADD CONSTRAINT "user_forgot_password_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_verify_email" ADD CONSTRAINT "user_verify_email_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
