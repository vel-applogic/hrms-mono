-- CreateTable
CREATE TABLE "user_employee_leave_counter" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "casual_leaves" INTEGER NOT NULL,
    "sick_leaves" INTEGER NOT NULL,
    "earned_leaves" INTEGER NOT NULL,
    "total_leaves_used" INTEGER NOT NULL,
    "total_leaves_available" INTEGER NOT NULL,
    "financial_year" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_employee_leave_counter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_employee_leave_counter_user_id_idx" ON "user_employee_leave_counter"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_employee_leave_counter_user_id_financial_year_key" ON "user_employee_leave_counter"("user_id", "financial_year");

-- AddForeignKey
ALTER TABLE "user_employee_leave_counter" ADD CONSTRAINT "user_employee_leave_counter_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
