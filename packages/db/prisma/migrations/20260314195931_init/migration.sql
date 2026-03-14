-- CreateEnum
CREATE TYPE "auditEntityTypeDbEnum" AS ENUM ('user', 'user_admin', 'candidate', 'employee', 'policy');

-- CreateEnum
CREATE TYPE "employeeStatusEnum" AS ENUM ('active', 'resigned', 'onLeave', 'terminated');

-- CreateEnum
CREATE TYPE "employeeMediaType" AS ENUM ('photo', 'document');

-- CreateEnum
CREATE TYPE "employeeFeedbackTrend" AS ENUM ('positive', 'negative', 'neutral');

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
CREATE TABLE "employee_salary" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "basic" DOUBLE PRECISION NOT NULL,
    "hra" DOUBLE PRECISION NOT NULL,
    "other_allowances" DOUBLE PRECISION NOT NULL,
    "gross" DOUBLE PRECISION NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_till" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_salary_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "employee_salary_user_id_idx" ON "employee_salary"("user_id");

-- CreateIndex
CREATE INDEX "user_employee_feedback_user_id_idx" ON "user_employee_feedback"("user_id");

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
ALTER TABLE "employee_salary" ADD CONSTRAINT "employee_salary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_feedback" ADD CONSTRAINT "user_employee_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_feedback" ADD CONSTRAINT "user_employee_feedback_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
