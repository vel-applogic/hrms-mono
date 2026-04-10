-- CreateEnum
CREATE TYPE "expenseType" AS ENUM ('salary', 'incomeTax', 'rent', 'ai', 'emailService', 'server', 'internet', 'phone', 'account', 'auditor', 'roc', 'digitalSignature', 'other');

-- CreateTable
CREATE TABLE "expense" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "type" "expenseType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expense_organization_id_idx" ON "expense"("organization_id");

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
