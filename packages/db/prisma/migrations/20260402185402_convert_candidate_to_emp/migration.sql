-- AlterTable
ALTER TABLE "candidate" ADD COLUMN     "aadhaar" TEXT,
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "employee_id" INTEGER,
ADD COLUMN     "pan" TEXT;

-- AlterTable
ALTER TABLE "user_employee_detail" ADD COLUMN     "candidate_id" INTEGER;

-- AddForeignKey
ALTER TABLE "user_employee_detail" ADD CONSTRAINT "user_employee_detail_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "user_employee_detail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
