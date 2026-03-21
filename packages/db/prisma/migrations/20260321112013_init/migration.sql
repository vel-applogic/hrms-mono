-- CreateEnum
CREATE TYPE "auditEntityTypeDbEnum" AS ENUM ('user', 'user_admin', 'candidate', 'employee', 'policy');

-- CreateEnum
CREATE TYPE "employeeStatusEnum" AS ENUM ('active', 'resigned', 'onLeave', 'terminated');

-- CreateEnum
CREATE TYPE "employeeMediaType" AS ENUM ('photo', 'resume', 'offerLetter', 'otherDocuments');

-- CreateEnum
CREATE TYPE "userEmployeeDeductionType" AS ENUM ('providentFund', 'incomeTax', 'insurance', 'professionalTax', 'loan', 'lop', 'other');

-- CreateEnum
CREATE TYPE "userEmployeeDeductionFrequency" AS ENUM ('monthly', 'yearly', 'specificMonth');

-- CreateEnum
CREATE TYPE "PayslipLineItemType" AS ENUM ('earning', 'deduction');

-- CreateEnum
CREATE TYPE "employeeFeedbackTrend" AS ENUM ('positive', 'negative', 'neutral');

-- CreateEnum
CREATE TYPE "leaveTypeEnum" AS ENUM ('casual', 'sick', 'medical', 'earned');

-- CreateEnum
CREATE TYPE "leaveStatusEnum" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "candidateSource" AS ENUM ('email', 'googleSearch', 'lead', 'linkedin', 'referral', 'websiteForm');

-- CreateEnum
CREATE TYPE "noticePeriodUnit" AS ENUM ('days', 'weeks', 'months');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('new', 'planed', 'notReachable', 'selected', 'onHold', 'rejected');

-- CreateEnum
CREATE TYPE "CandidateProgress" AS ENUM ('new', 'infoCollected', 'lev1InterviewScheduled', 'lev1InterviewCompleted', 'lev2InterviewScheduled', 'lev2InterviewCompleted', 'offerReleased', 'offerAccepted');

-- CreateEnum
CREATE TYPE "candidateMediaType" AS ENUM ('resume', 'offerLetter', 'otherDocuments');

-- CreateEnum
CREATE TYPE "userRoleDbEnum" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "PlanEnum" AS ENUM ('free', 'premium');

-- CreateEnum
CREATE TYPE "mediaTypeDbEnum" AS ENUM ('doc', 'image', 'zip', 'video');

-- CreateEnum
CREATE TYPE "auditEventGroupDbEnum" AS ENUM ('authentication', 'operation');

-- CreateEnum
CREATE TYPE "auditEventTypeDbEnum" AS ENUM ('login_success', 'login_failure', 'create', 'update', 'delete', 'password_reset', 'password_reset_request', 'otp_request', 'register', 'email_verify', 'account_activate', 'confirm', 'upgrade_plan', 'downgrade_plan', 'block_user', 'unblock_user');

-- CreateEnum
CREATE TYPE "auditActivityStatusDbEnum" AS ENUM ('success', 'failure');

-- CreateTable
CREATE TABLE "app_migrations" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_activity" (
    "id" SERIAL NOT NULL,
    "event_group" "auditEventGroupDbEnum" NOT NULL,
    "event_type" "auditEventTypeDbEnum" NOT NULL,
    "status" "auditActivityStatusDbEnum" NOT NULL,
    "actor_id" INTEGER,
    "description" TEXT,
    "data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_activity_has_entity" (
    "id" SERIAL NOT NULL,
    "audit_id" INTEGER NOT NULL,
    "entity_type" "auditEntityTypeDbEnum" NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "message" TEXT,
    "is_source_entity" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_activity_has_entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "thumbnail_key" TEXT,
    "type" "mediaTypeDbEnum" NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "ext" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "role" "userRoleDbEnum" NOT NULL DEFAULT 'user',
    "plan" "PlanEnum" NOT NULL DEFAULT 'free',
    "password" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_logged_in_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "user_plan_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plan" "PlanEnum" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_plan_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_employee_detail" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "personal_email" TEXT,
    "dob" TIMESTAMP(3) NOT NULL,
    "pan" TEXT NOT NULL,
    "aadhaar" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "date_of_joining" TIMESTAMP(3) NOT NULL,
    "date_of_leaving" TIMESTAMP(3),
    "status" "employeeStatusEnum" NOT NULL,
    "report_to_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_employee_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_has_media" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "type" "employeeMediaType" NOT NULL,
    "caption" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_has_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_compensation" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "basic" INTEGER NOT NULL,
    "hra" INTEGER NOT NULL,
    "other_allowances" INTEGER NOT NULL,
    "gross" INTEGER NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_till" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_compensation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_employee_deduction" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "userEmployeeDeductionType" NOT NULL,
    "frequency" "userEmployeeDeductionFrequency" NOT NULL,
    "amount" INTEGER NOT NULL,
    "other_title" TEXT,
    "effective_from" DATE NOT NULL,
    "effective_till" DATE,
    "specific_month" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_employee_deduction_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "user_employee_feedback" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "trend" "employeeFeedbackTrend" NOT NULL,
    "point" INTEGER DEFAULT 0,
    "title" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_employee_feedback_pkey" PRIMARY KEY ("id")
);

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
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "number_of_days" INTEGER NOT NULL,
    "number_of_lop_days" INTEGER NOT NULL DEFAULT 0,
    "is_consumed" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT NOT NULL,
    "status" "leaveStatusEnum" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_has_media" (
    "id" SERIAL NOT NULL,
    "leave_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_has_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateHasMedia" (
    "id" SERIAL NOT NULL,
    "candidate_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "type" "candidateMediaType" NOT NULL,

    CONSTRAINT "CandidateHasMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate" (
    "id" SERIAL NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactNumbers" TEXT[],
    "source" "candidateSource" NOT NULL,
    "urls" TEXT[],
    "expInYears" DOUBLE PRECISION NOT NULL,
    "relevantExpInYears" DOUBLE PRECISION NOT NULL,
    "skills" TEXT[],
    "currentCtcInLacs" DOUBLE PRECISION NOT NULL,
    "expectedCtcInLacs" DOUBLE PRECISION NOT NULL,
    "noticePeriod" DOUBLE PRECISION NOT NULL,
    "noticePeriodUnit" "noticePeriodUnit" NOT NULL,
    "status" "CandidateStatus" NOT NULL DEFAULT 'new',
    "progress" "CandidateProgress" NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_has_feedback" (
    "id" SERIAL NOT NULL,
    "candidate_id" INTEGER NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_has_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_has_media" (
    "id" SERIAL NOT NULL,
    "policy_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policy_has_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_migrations_key_key" ON "app_migrations"("key");

-- CreateIndex
CREATE INDEX "audit_activity_event_group_event_type_idx" ON "audit_activity"("event_group", "event_type");

-- CreateIndex
CREATE INDEX "audit_activity_actor_id_idx" ON "audit_activity"("actor_id");

-- CreateIndex
CREATE INDEX "audit_activity_created_at_idx" ON "audit_activity"("created_at");

-- CreateIndex
CREATE INDEX "audit_activity_status_idx" ON "audit_activity"("status");

-- CreateIndex
CREATE INDEX "audit_activity_has_entity_audit_id_idx" ON "audit_activity_has_entity"("audit_id");

-- CreateIndex
CREATE INDEX "audit_activity_has_entity_entity_type_entity_id_idx" ON "audit_activity_has_entity"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_employee_detail_user_id_key" ON "user_employee_detail"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_employee_detail_pan_key" ON "user_employee_detail"("pan");

-- CreateIndex
CREATE UNIQUE INDEX "user_employee_detail_aadhaar_key" ON "user_employee_detail"("aadhaar");

-- CreateIndex
CREATE INDEX "user_employee_detail_user_id_idx" ON "user_employee_detail"("user_id");

-- CreateIndex
CREATE INDEX "user_employee_detail_report_to_id_idx" ON "user_employee_detail"("report_to_id");

-- CreateIndex
CREATE INDEX "user_employee_detail_status_idx" ON "user_employee_detail"("status");

-- CreateIndex
CREATE INDEX "employee_has_media_user_id_idx" ON "employee_has_media"("user_id");

-- CreateIndex
CREATE INDEX "employee_compensation_user_id_idx" ON "employee_compensation"("user_id");

-- CreateIndex
CREATE INDEX "user_employee_deduction_user_id_idx" ON "user_employee_deduction"("user_id");

-- CreateIndex
CREATE INDEX "payslip_user_id_idx" ON "payslip"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "payslip_user_id_month_year_key" ON "payslip"("user_id", "month", "year");

-- CreateIndex
CREATE INDEX "payslip_line_item_payslip_id_idx" ON "payslip_line_item"("payslip_id");

-- CreateIndex
CREATE INDEX "user_employee_feedback_user_id_idx" ON "user_employee_feedback"("user_id");

-- CreateIndex
CREATE INDEX "user_employee_leave_counter_user_id_idx" ON "user_employee_leave_counter"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_employee_leave_counter_user_id_financial_year_key" ON "user_employee_leave_counter"("user_id", "financial_year");

-- CreateIndex
CREATE INDEX "leave_user_id_idx" ON "leave"("user_id");

-- CreateIndex
CREATE INDEX "leave_has_media_leave_id_idx" ON "leave_has_media"("leave_id");

-- CreateIndex
CREATE INDEX "leave_has_media_media_id_idx" ON "leave_has_media"("media_id");

-- CreateIndex
CREATE INDEX "candidate_has_feedback_candidate_id_idx" ON "candidate_has_feedback"("candidate_id");

-- AddForeignKey
ALTER TABLE "audit_activity" ADD CONSTRAINT "audit_activity_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_activity_has_entity" ADD CONSTRAINT "audit_activity_has_entity_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audit_activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_forgot_password" ADD CONSTRAINT "user_forgot_password_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_verify_email" ADD CONSTRAINT "user_verify_email_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_plan_history" ADD CONSTRAINT "user_plan_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_detail" ADD CONSTRAINT "user_employee_detail_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_detail" ADD CONSTRAINT "user_employee_detail_report_to_id_fkey" FOREIGN KEY ("report_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_has_media" ADD CONSTRAINT "employee_has_media_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_has_media" ADD CONSTRAINT "employee_has_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_compensation" ADD CONSTRAINT "employee_compensation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_deduction" ADD CONSTRAINT "user_employee_deduction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip" ADD CONSTRAINT "payslip_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip_line_item" ADD CONSTRAINT "payslip_line_item_payslip_id_fkey" FOREIGN KEY ("payslip_id") REFERENCES "payslip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_feedback" ADD CONSTRAINT "user_employee_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_feedback" ADD CONSTRAINT "user_employee_feedback_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_leave_counter" ADD CONSTRAINT "user_employee_leave_counter_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave" ADD CONSTRAINT "leave_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_has_media" ADD CONSTRAINT "leave_has_media_leave_id_fkey" FOREIGN KEY ("leave_id") REFERENCES "leave"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_has_media" ADD CONSTRAINT "leave_has_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateHasMedia" ADD CONSTRAINT "CandidateHasMedia_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateHasMedia" ADD CONSTRAINT "CandidateHasMedia_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_has_feedback" ADD CONSTRAINT "candidate_has_feedback_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_has_feedback" ADD CONSTRAINT "candidate_has_feedback_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_has_media" ADD CONSTRAINT "policy_has_media_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_has_media" ADD CONSTRAINT "policy_has_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
