-- CreateEnum
CREATE TYPE "PayslipLineItemType" AS ENUM ('earning', 'deduction');

-- CreateTable
CREATE TABLE "payslip" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "gross_amount" INTEGER NOT NULL,
    "net_amount" INTEGER NOT NULL,
    "deduction_amount" INTEGER NOT NULL,

    CONSTRAINT "payslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslip_line_item" (
    "id" SERIAL NOT NULL,
    "payslip_id" INTEGER NOT NULL,
    "type" "PayslipLineItemType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payslip_line_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payslip_user_id_idx" ON "payslip"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "payslip_user_id_month_year_key" ON "payslip"("user_id", "month", "year");

-- CreateIndex
CREATE INDEX "payslip_line_item_payslip_id_idx" ON "payslip_line_item"("payslip_id");

-- AddForeignKey
ALTER TABLE "payslip" ADD CONSTRAINT "payslip_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip_line_item" ADD CONSTRAINT "payslip_line_item_payslip_id_fkey" FOREIGN KEY ("payslip_id") REFERENCES "payslip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
