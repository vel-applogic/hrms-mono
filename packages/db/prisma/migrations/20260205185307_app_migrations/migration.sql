-- CreateTable
CREATE TABLE "app_migrations" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_migrations_key_key" ON "app_migrations"("key");
