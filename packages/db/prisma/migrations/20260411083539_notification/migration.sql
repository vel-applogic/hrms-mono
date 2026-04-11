-- CreateEnum
CREATE TYPE "notificationLinkDbEnum" AS ENUM ('dashboard', 'employee', 'leaves', 'reimbursement', 'device', 'payroll', 'candidate', 'policy', 'expense', 'organization', 'user', 'empDashboard', 'empLeave', 'empDetails', 'empDocuments', 'empPayroll', 'empDevice', 'empReimbursement', 'empFeedbacks', 'empPolicy');

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" "notificationLinkDbEnum" NOT NULL,
    "is_seen" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_user_id_is_seen_idx" ON "notification"("user_id", "is_seen");

-- CreateIndex
CREATE INDEX "notification_organization_id_idx" ON "notification"("organization_id");

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
