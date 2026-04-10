-- CreateEnum
CREATE TYPE "expenseForecastFrequency" AS ENUM ('monthly', 'yearly');

-- AlterTable
ALTER TABLE "expense" ALTER COLUMN "description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "expense_forecast" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "description" TEXT,
    "type" "expenseType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "frequency" "expenseForecastFrequency" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_forecast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expense_forecast_organization_id_idx" ON "expense_forecast"("organization_id");

-- AddForeignKey
ALTER TABLE "expense_forecast" ADD CONSTRAINT "expense_forecast_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
