-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('phone', 'email', 'website', 'socialMediaLink');

-- CreateEnum
CREATE TYPE "NoOfDaysInMonthDbEnum" AS ENUM ('dynamic', 'thirty', 'thirtyOne');

-- CreateEnum
CREATE TYPE "holidayType" AS ENUM ('national', 'state');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('mobile', 'tablet', 'laptop', 'cpu', 'keyboard', 'mouse', 'headphone', 'other');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('good', 'physicallyDamaged', 'notWorking', 'lost', 'stolen');

-- CreateEnum
CREATE TYPE "auditEntityTypeDbEnum" AS ENUM ('user', 'user_admin', 'candidate', 'employee', 'policy', 'device', 'announcement');

-- CreateEnum
CREATE TYPE "reimbursementStatusDbEnum" AS ENUM ('pending', 'approved', 'paid', 'rejected');

-- CreateEnum
CREATE TYPE "notificationLinkDbEnum" AS ENUM ('dashboard', 'employee', 'leaves', 'reimbursement', 'device', 'payroll', 'candidate', 'policy', 'expense', 'organisation', 'user', 'empDashboard', 'empLeave', 'empDetails', 'empDocuments', 'empPayroll', 'empDevice', 'empReimbursement', 'empFeedbacks', 'empPolicy', 'announcement', 'empAnnouncement');

-- CreateEnum
CREATE TYPE "expenseForecastFrequency" AS ENUM ('monthly', 'yearly');

-- CreateEnum
CREATE TYPE "expenseType" AS ENUM ('salary', 'incomeTax', 'rent', 'ai', 'emailService', 'server', 'internet', 'phone', 'account', 'auditor', 'roc', 'digitalSignature', 'other');

-- CreateEnum
CREATE TYPE "userRoleDbEnum" AS ENUM ('admin', 'employee');

-- CreateEnum
CREATE TYPE "genderDbEnum" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "employeeStatusEnum" AS ENUM ('active', 'resigned', 'onLeave', 'terminated');

-- CreateEnum
CREATE TYPE "employeeMediaType" AS ENUM ('photo', 'resume', 'offerLetter', 'otherDocuments');

-- CreateEnum
CREATE TYPE "userEmployeeDeductionType" AS ENUM ('providentFund', 'incomeTax', 'insurance', 'professionalTax', 'loan', 'lop', 'other');

-- CreateEnum
CREATE TYPE "userEmployeeDeductionFrequency" AS ENUM ('monthly', 'yearly', 'specificMonth');

-- CreateEnum
CREATE TYPE "PayrollPayslipLineItemType" AS ENUM ('earning', 'deduction');

-- CreateEnum
CREATE TYPE "employeeFeedbackTrend" AS ENUM ('positive', 'negative', 'neutral');

-- CreateEnum
CREATE TYPE "leaveTypeEnum" AS ENUM ('casual', 'sick', 'medical', 'earned');

-- CreateEnum
CREATE TYPE "leaveStatusEnum" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "leaveDayHalfEnum" AS ENUM ('full', 'firstHalf', 'secondHalf');

-- CreateEnum
CREATE TYPE "mediaTypeDbEnum" AS ENUM ('doc', 'image', 'zip', 'video');

-- CreateEnum
CREATE TYPE "auditEventGroupDbEnum" AS ENUM ('authentication', 'operation');

-- CreateEnum
CREATE TYPE "auditEventTypeDbEnum" AS ENUM ('login_success', 'login_failure', 'create', 'update', 'delete', 'password_reset', 'password_reset_request', 'otp_request', 'register', 'email_verify', 'account_activate', 'confirm', 'block_user', 'unblock_user');

-- CreateEnum
CREATE TYPE "auditActivityStatusDbEnum" AS ENUM ('success', 'failure');

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

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
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
CREATE TABLE "currency" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT,

    CONSTRAINT "currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "country_id" INTEGER NOT NULL,
    "address_line_1" TEXT NOT NULL,
    "address_line_2" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "contact_number" TEXT NOT NULL,
    "contact_type" "ContactType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "gender" "genderDbEnum" NOT NULL,
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
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
CREATE TABLE "UserInBranch" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_invite" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "invite_key" TEXT NOT NULL,
    "invited_by_id" INTEGER NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_possession_history" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "device_id" INTEGER NOT NULL,
    "from_date" TIMESTAMP(3) NOT NULL,
    "to_date" TIMESTAMP(3),
    "notes" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_possession_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logo_id" INTEGER,
    "website" TEXT,
    "currency_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganisationFinancialYear" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganisationFinancialYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisation_has_contact" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisation_has_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisation_has_address" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "address_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisation_has_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisation_has_user" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "roles" "userRoleDbEnum"[],

    CONSTRAINT "organisation_has_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisation_settings" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "no_of_days_in_month" "NoOfDaysInMonthDbEnum" NOT NULL DEFAULT 'thirty',
    "total_leave_in_days" INTEGER NOT NULL DEFAULT 24,
    "sick_leave_in_days" INTEGER NOT NULL DEFAULT 10,
    "earned_leave_in_days" INTEGER NOT NULL DEFAULT 10,
    "casual_leave_in_days" INTEGER NOT NULL DEFAULT 10,
    "maternity_leave_in_days" INTEGER NOT NULL DEFAULT 10,
    "paternity_leave_in_days" INTEGER NOT NULL DEFAULT 10,
    "weekly_off_days" INTEGER[] DEFAULT ARRAY[0, 6]::INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisation_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisation_has_document" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "document_id" INTEGER NOT NULL,
    "media_type" "mediaTypeDbEnum" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisation_has_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branche" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_in_department" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_in_department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_employee_detail" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "employee_code" TEXT NOT NULL,
    "personal_email" TEXT,
    "dob" TIMESTAMP(3) NOT NULL,
    "pan" TEXT,
    "aadhaar" TEXT,
    "designation" TEXT NOT NULL,
    "date_of_joining" TIMESTAMP(3) NOT NULL,
    "date_of_leaving" TIMESTAMP(3),
    "status" "employeeStatusEnum" NOT NULL,
    "report_to_id" INTEGER,
    "is_bg_verified" BOOLEAN NOT NULL DEFAULT false,
    "emergency_contact_name" TEXT NOT NULL,
    "emergency_contact_number" TEXT NOT NULL,
    "emergency_contact_relationship" TEXT NOT NULL,
    "branch_id" INTEGER,
    "department_id" INTEGER,
    "candidate_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_employee_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_bgv_feedback" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_bgv_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_bgv_feedback_has_media" (
    "id" SERIAL NOT NULL,
    "employee_bgv_feedback_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_bgv_feedback_has_media_pkey" PRIMARY KEY ("id")
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
    "organisation_id" INTEGER NOT NULL,
    "gross_amount" DOUBLE PRECISION NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_till" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_compensation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_compensation_line_item" (
    "id" SERIAL NOT NULL,
    "payroll_compensation_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_compensation_line_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_employee_deduction" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_till" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_employee_deduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_deduction_line_item" (
    "id" SERIAL NOT NULL,
    "payroll_deduction_id" INTEGER NOT NULL,
    "type" "userEmployeeDeductionType" NOT NULL,
    "frequency" "userEmployeeDeductionFrequency" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "other_title" TEXT,
    "specific_month" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_deduction_line_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_employee_feedback" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organisation_id" INTEGER NOT NULL,
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
    "organisation_id" INTEGER NOT NULL,
    "casual_leaves" DOUBLE PRECISION NOT NULL,
    "sick_leaves" DOUBLE PRECISION NOT NULL,
    "earned_leaves" DOUBLE PRECISION NOT NULL,
    "total_leaves_used" DOUBLE PRECISION NOT NULL,
    "total_leaves_available" DOUBLE PRECISION NOT NULL,
    "financial_year" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_employee_leave_counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslip" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "gross_amount" INTEGER NOT NULL,
    "net_amount" INTEGER NOT NULL,
    "deduction_amount" INTEGER NOT NULL,
    "pdf_s3_key" TEXT NOT NULL,

    CONSTRAINT "payslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslip_line_item" (
    "id" SERIAL NOT NULL,
    "payslip_id" INTEGER NOT NULL,
    "type" "PayrollPayslipLineItemType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payslip_line_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "leave_type" "leaveTypeEnum" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "start_duration" "leaveDayHalfEnum" NOT NULL DEFAULT 'full',
    "end_duration" "leaveDayHalfEnum" NOT NULL DEFAULT 'full',
    "number_of_days" DOUBLE PRECISION NOT NULL,
    "number_of_lop_days" DOUBLE PRECISION NOT NULL DEFAULT 0,
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
    "organisation_id" INTEGER NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "gender" "genderDbEnum" NOT NULL,
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
    "dob" TIMESTAMP(3),
    "pan" TEXT,
    "aadhaar" TEXT,
    "employee_id" INTEGER,
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
    "organisation_id" INTEGER NOT NULL,
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

-- CreateTable
CREATE TABLE "announcement" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "branch_id" INTEGER,
    "department_id" INTEGER,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_notification_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holiday" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "types" "holidayType"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "type" "DeviceType" NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "purchased_at" DATE,
    "warranty_expires_at" DATE NOT NULL,
    "in_warranty" BOOLEAN NOT NULL DEFAULT true,
    "status" "DeviceStatus" NOT NULL,
    "config" TEXT,
    "assigned_to_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_has_media" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "caption" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_has_media_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "app_migrations" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "description" TEXT,
    "type" "expenseType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_forecast" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "description" TEXT,
    "type" "expenseType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "frequency" "expenseForecastFrequency" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_forecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reimbursement" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" DATE NOT NULL,
    "status" "reimbursementStatusDbEnum" NOT NULL DEFAULT 'pending',
    "reject_reason" TEXT,
    "approved_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reimbursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reimbursement_has_media" (
    "id" SERIAL NOT NULL,
    "reimbursement_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reimbursement_has_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reimbursement_has_feedback" (
    "id" SERIAL NOT NULL,
    "reimbursement_id" INTEGER NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reimbursement_has_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" "notificationLinkDbEnum" NOT NULL,
    "is_seen" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "currency_code_key" ON "currency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "country_code_key" ON "country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserInBranch_user_id_branch_id_key" ON "UserInBranch"("user_id", "branch_id");

-- CreateIndex
CREATE INDEX "user_invite_user_id_idx" ON "user_invite"("user_id");

-- CreateIndex
CREATE INDEX "user_invite_organisation_id_idx" ON "user_invite"("organisation_id");

-- CreateIndex
CREATE INDEX "device_possession_history_user_id_idx" ON "device_possession_history"("user_id");

-- CreateIndex
CREATE INDEX "device_possession_history_device_id_idx" ON "device_possession_history"("device_id");

-- CreateIndex
CREATE INDEX "device_possession_history_organisation_id_idx" ON "device_possession_history"("organisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "organisation_has_contact_organisation_id_contact_id_key" ON "organisation_has_contact"("organisation_id", "contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "organisation_has_address_organisation_id_address_id_key" ON "organisation_has_address"("organisation_id", "address_id");

-- CreateIndex
CREATE UNIQUE INDEX "organisation_has_user_organisation_id_user_id_key" ON "organisation_has_user"("organisation_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "department_name_organisation_id_key" ON "department"("name", "organisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_in_department_user_id_department_id_key" ON "user_in_department"("user_id", "department_id");

-- CreateIndex
CREATE INDEX "user_employee_detail_user_id_idx" ON "user_employee_detail"("user_id");

-- CreateIndex
CREATE INDEX "user_employee_detail_report_to_id_idx" ON "user_employee_detail"("report_to_id");

-- CreateIndex
CREATE INDEX "user_employee_detail_status_idx" ON "user_employee_detail"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_employee_detail_user_id_organisation_id_key" ON "user_employee_detail"("user_id", "organisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_employee_detail_employee_code_organisation_id_key" ON "user_employee_detail"("employee_code", "organisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_employee_detail_pan_organisation_id_key" ON "user_employee_detail"("pan", "organisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_employee_detail_aadhaar_organisation_id_key" ON "user_employee_detail"("aadhaar", "organisation_id");

-- CreateIndex
CREATE INDEX "employee_bgv_feedback_user_id_idx" ON "employee_bgv_feedback"("user_id");

-- CreateIndex
CREATE INDEX "employee_bgv_feedback_has_media_employee_bgv_feedback_id_idx" ON "employee_bgv_feedback_has_media"("employee_bgv_feedback_id");

-- CreateIndex
CREATE INDEX "employee_bgv_feedback_has_media_media_id_idx" ON "employee_bgv_feedback_has_media"("media_id");

-- CreateIndex
CREATE INDEX "employee_has_media_user_id_idx" ON "employee_has_media"("user_id");

-- CreateIndex
CREATE INDEX "employee_compensation_user_id_idx" ON "employee_compensation"("user_id");

-- CreateIndex
CREATE INDEX "user_employee_deduction_user_id_idx" ON "user_employee_deduction"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_deduction_line_item_payroll_deduction_id_type_frequ_key" ON "payroll_deduction_line_item"("payroll_deduction_id", "type", "frequency");

-- CreateIndex
CREATE INDEX "user_employee_feedback_user_id_idx" ON "user_employee_feedback"("user_id");

-- CreateIndex
CREATE INDEX "user_employee_leave_counter_user_id_organisation_id_idx" ON "user_employee_leave_counter"("user_id", "organisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_employee_leave_counter_user_id_organisation_id_financi_key" ON "user_employee_leave_counter"("user_id", "organisation_id", "financial_year");

-- CreateIndex
CREATE INDEX "payslip_user_id_idx" ON "payslip"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "payslip_user_id_month_year_key" ON "payslip"("user_id", "month", "year");

-- CreateIndex
CREATE INDEX "payslip_line_item_payslip_id_idx" ON "payslip_line_item"("payslip_id");

-- CreateIndex
CREATE INDEX "leave_user_id_idx" ON "leave"("user_id");

-- CreateIndex
CREATE INDEX "leave_has_media_leave_id_idx" ON "leave_has_media"("leave_id");

-- CreateIndex
CREATE INDEX "leave_has_media_media_id_idx" ON "leave_has_media"("media_id");

-- CreateIndex
CREATE INDEX "candidate_organisation_id_idx" ON "candidate"("organisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_email_organisation_id_key" ON "candidate"("email", "organisation_id");

-- CreateIndex
CREATE INDEX "candidate_has_feedback_candidate_id_idx" ON "candidate_has_feedback"("candidate_id");

-- CreateIndex
CREATE INDEX "announcement_is_published_is_notification_sent_scheduled_at_idx" ON "announcement"("is_published", "is_notification_sent", "scheduled_at");

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
CREATE UNIQUE INDEX "app_migrations_key_key" ON "app_migrations"("key");

-- CreateIndex
CREATE INDEX "expense_organisation_id_idx" ON "expense"("organisation_id");

-- CreateIndex
CREATE INDEX "expense_forecast_organisation_id_idx" ON "expense_forecast"("organisation_id");

-- CreateIndex
CREATE INDEX "reimbursement_organisation_id_idx" ON "reimbursement"("organisation_id");

-- CreateIndex
CREATE INDEX "reimbursement_user_id_idx" ON "reimbursement"("user_id");

-- CreateIndex
CREATE INDEX "reimbursement_has_media_reimbursement_id_idx" ON "reimbursement_has_media"("reimbursement_id");

-- CreateIndex
CREATE INDEX "reimbursement_has_media_media_id_idx" ON "reimbursement_has_media"("media_id");

-- CreateIndex
CREATE INDEX "reimbursement_has_feedback_reimbursement_id_idx" ON "reimbursement_has_feedback"("reimbursement_id");

-- CreateIndex
CREATE INDEX "notification_user_id_is_seen_idx" ON "notification"("user_id", "is_seen");

-- CreateIndex
CREATE INDEX "notification_organisation_id_idx" ON "notification"("organisation_id");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_forgot_password" ADD CONSTRAINT "user_forgot_password_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_verify_email" ADD CONSTRAINT "user_verify_email_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInBranch" ADD CONSTRAINT "UserInBranch_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInBranch" ADD CONSTRAINT "UserInBranch_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branche"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInBranch" ADD CONSTRAINT "UserInBranch_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invite" ADD CONSTRAINT "user_invite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invite" ADD CONSTRAINT "user_invite_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invite" ADD CONSTRAINT "user_invite_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_possession_history" ADD CONSTRAINT "device_possession_history_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_possession_history" ADD CONSTRAINT "device_possession_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_possession_history" ADD CONSTRAINT "device_possession_history_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation" ADD CONSTRAINT "organisation_logo_id_fkey" FOREIGN KEY ("logo_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation" ADD CONSTRAINT "organisation_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganisationFinancialYear" ADD CONSTRAINT "OrganisationFinancialYear_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_has_contact" ADD CONSTRAINT "organisation_has_contact_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_has_contact" ADD CONSTRAINT "organisation_has_contact_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_has_address" ADD CONSTRAINT "organisation_has_address_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_has_address" ADD CONSTRAINT "organisation_has_address_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_has_user" ADD CONSTRAINT "organisation_has_user_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_has_user" ADD CONSTRAINT "organisation_has_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_settings" ADD CONSTRAINT "organisation_settings_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_has_document" ADD CONSTRAINT "organisation_has_document_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_has_document" ADD CONSTRAINT "organisation_has_document_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branche" ADD CONSTRAINT "branche_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_in_department" ADD CONSTRAINT "user_in_department_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_in_department" ADD CONSTRAINT "user_in_department_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_in_department" ADD CONSTRAINT "user_in_department_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_detail" ADD CONSTRAINT "user_employee_detail_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_detail" ADD CONSTRAINT "user_employee_detail_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_detail" ADD CONSTRAINT "user_employee_detail_report_to_id_fkey" FOREIGN KEY ("report_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_detail" ADD CONSTRAINT "user_employee_detail_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branche"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_detail" ADD CONSTRAINT "user_employee_detail_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_detail" ADD CONSTRAINT "user_employee_detail_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_bgv_feedback" ADD CONSTRAINT "employee_bgv_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_bgv_feedback" ADD CONSTRAINT "employee_bgv_feedback_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_bgv_feedback_has_media" ADD CONSTRAINT "employee_bgv_feedback_has_media_employee_bgv_feedback_id_fkey" FOREIGN KEY ("employee_bgv_feedback_id") REFERENCES "employee_bgv_feedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_bgv_feedback_has_media" ADD CONSTRAINT "employee_bgv_feedback_has_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_has_media" ADD CONSTRAINT "employee_has_media_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_has_media" ADD CONSTRAINT "employee_has_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_compensation" ADD CONSTRAINT "employee_compensation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_compensation" ADD CONSTRAINT "employee_compensation_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_compensation_line_item" ADD CONSTRAINT "payroll_compensation_line_item_payroll_compensation_id_fkey" FOREIGN KEY ("payroll_compensation_id") REFERENCES "employee_compensation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_deduction" ADD CONSTRAINT "user_employee_deduction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_deduction" ADD CONSTRAINT "user_employee_deduction_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_deduction_line_item" ADD CONSTRAINT "payroll_deduction_line_item_payroll_deduction_id_fkey" FOREIGN KEY ("payroll_deduction_id") REFERENCES "user_employee_deduction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_feedback" ADD CONSTRAINT "user_employee_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_feedback" ADD CONSTRAINT "user_employee_feedback_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_feedback" ADD CONSTRAINT "user_employee_feedback_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_leave_counter" ADD CONSTRAINT "user_employee_leave_counter_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_employee_leave_counter" ADD CONSTRAINT "user_employee_leave_counter_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip" ADD CONSTRAINT "payslip_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip" ADD CONSTRAINT "payslip_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip_line_item" ADD CONSTRAINT "payslip_line_item_payslip_id_fkey" FOREIGN KEY ("payslip_id") REFERENCES "payslip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave" ADD CONSTRAINT "leave_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave" ADD CONSTRAINT "leave_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_has_media" ADD CONSTRAINT "leave_has_media_leave_id_fkey" FOREIGN KEY ("leave_id") REFERENCES "leave"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_has_media" ADD CONSTRAINT "leave_has_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateHasMedia" ADD CONSTRAINT "CandidateHasMedia_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateHasMedia" ADD CONSTRAINT "CandidateHasMedia_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "user_employee_detail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_has_feedback" ADD CONSTRAINT "candidate_has_feedback_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_has_feedback" ADD CONSTRAINT "candidate_has_feedback_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy" ADD CONSTRAINT "policy_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_has_media" ADD CONSTRAINT "policy_has_media_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_has_media" ADD CONSTRAINT "policy_has_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branche"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday" ADD CONSTRAINT "holiday_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device" ADD CONSTRAINT "device_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device" ADD CONSTRAINT "device_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_has_media" ADD CONSTRAINT "device_has_media_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_has_media" ADD CONSTRAINT "device_has_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_activity" ADD CONSTRAINT "audit_activity_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_activity_has_entity" ADD CONSTRAINT "audit_activity_has_entity_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audit_activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_forecast" ADD CONSTRAINT "expense_forecast_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reimbursement" ADD CONSTRAINT "reimbursement_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reimbursement" ADD CONSTRAINT "reimbursement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reimbursement_has_media" ADD CONSTRAINT "reimbursement_has_media_reimbursement_id_fkey" FOREIGN KEY ("reimbursement_id") REFERENCES "reimbursement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reimbursement_has_media" ADD CONSTRAINT "reimbursement_has_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reimbursement_has_feedback" ADD CONSTRAINT "reimbursement_has_feedback_reimbursement_id_fkey" FOREIGN KEY ("reimbursement_id") REFERENCES "reimbursement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reimbursement_has_feedback" ADD CONSTRAINT "reimbursement_has_feedback_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
