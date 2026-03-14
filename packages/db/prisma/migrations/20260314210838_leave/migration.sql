-- CreateEnum
CREATE TYPE "leaveTypeEnum" AS ENUM ('casual', 'sick', 'medical', 'earned');

-- CreateEnum
CREATE TYPE "leaveStatusEnum" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- CreateTable
CREATE TABLE "leave_config" (
    "id" SERIAL NOT NULL,
    "max_leaves" INTEGER NOT NULL,
    "max_sick_leaves" INTEGER NOT NULL,
    "max_earned_leaves" INTEGER NOT NULL,
    "max_casual_leaves" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "leave_type" "leaveTypeEnum" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "number_of_days" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "leaveStatusEnum" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leave_user_id_idx" ON "leave"("user_id");

-- AddForeignKey
ALTER TABLE "leave" ADD CONSTRAINT "leave_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
