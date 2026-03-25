-- CreateTable
CREATE TABLE "user_invite" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "invite_key" TEXT NOT NULL,
    "invited_by_id" INTEGER NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_invite_user_id_idx" ON "user_invite"("user_id");

-- CreateIndex
CREATE INDEX "user_invite_organization_id_idx" ON "user_invite"("organization_id");

-- AddForeignKey
ALTER TABLE "user_invite" ADD CONSTRAINT "user_invite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invite" ADD CONSTRAINT "user_invite_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invite" ADD CONSTRAINT "user_invite_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
