-- CreateEnum
CREATE TYPE "PlanTypeEnum" AS ENUM ('free', 'premium');

-- CreateTable
CREATE TABLE "plan" (
    "id" SERIAL NOT NULL,
    "type" "PlanTypeEnum" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_has_plan" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_has_plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_has_plan_user_id_plan_id_key" ON "user_has_plan"("user_id", "plan_id");

-- AddForeignKey
ALTER TABLE "user_has_plan" ADD CONSTRAINT "user_has_plan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_has_plan" ADD CONSTRAINT "user_has_plan_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
