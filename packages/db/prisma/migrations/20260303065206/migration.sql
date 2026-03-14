-- CreateEnum
CREATE TYPE "auditEventGroupDbEnum" AS ENUM ('authentication', 'operation');

-- CreateEnum
CREATE TYPE "auditEventTypeDbEnum" AS ENUM ('login_success', 'login_failure', 'create', 'update', 'delete', 'password_reset', 'password_reset_request', 'otp_request', 'register', 'email_verify', 'account_activate', 'confirm');

-- CreateEnum
CREATE TYPE "auditActivityStatusDbEnum" AS ENUM ('success', 'failure');

-- CreateEnum
CREATE TYPE "auditEntityTypeDbEnum" AS ENUM ('user', 'user_admin', 'chapter', 'topic', 'slide', 'flashcard', 'question', 'theme');

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

-- AddForeignKey
ALTER TABLE "audit_activity" ADD CONSTRAINT "audit_activity_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_activity_has_entity" ADD CONSTRAINT "audit_activity_has_entity_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audit_activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
