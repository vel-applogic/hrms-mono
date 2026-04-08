-- CreateEnum
CREATE TYPE "leaveDayHalfEnum" AS ENUM ('full', 'firstHalf', 'secondHalf');

-- AlterTable
ALTER TABLE "leave" ADD COLUMN     "end_duration" "leaveDayHalfEnum" NOT NULL DEFAULT 'full',
ADD COLUMN     "start_duration" "leaveDayHalfEnum" NOT NULL DEFAULT 'full',
ALTER COLUMN "number_of_days" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "number_of_lop_days" SET DEFAULT 0,
ALTER COLUMN "number_of_lop_days" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "user_employee_leave_counter" ALTER COLUMN "casual_leaves" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "sick_leaves" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "earned_leaves" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "total_leaves_used" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "total_leaves_available" SET DATA TYPE DOUBLE PRECISION;
