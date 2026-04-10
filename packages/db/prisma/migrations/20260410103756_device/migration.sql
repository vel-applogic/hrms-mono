-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('mobile', 'tablet', 'laptop', 'cpu', 'keyboard', 'mouse', 'headphone', 'other');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('good', 'physicallyDamaged', 'notWorking', 'lost', 'stolen');

-- CreateTable
CREATE TABLE "user_has_device" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "device_id" INTEGER NOT NULL,
    "possession_from" TIMESTAMP(3) NOT NULL,
    "return_at" TIMESTAMP(3),
    "in_possession" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT[],
    "return_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_has_device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "type" "DeviceType" NOT NULL,
    "model" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "purchased_at" DATE,
    "warranty_expires_at" DATE NOT NULL,
    "in_warranty" BOOLEAN NOT NULL DEFAULT true,
    "status" "DeviceStatus" NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "user_has_device_user_id_device_id_key" ON "user_has_device"("user_id", "device_id");

-- AddForeignKey
ALTER TABLE "user_has_device" ADD CONSTRAINT "user_has_device_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_has_device" ADD CONSTRAINT "user_has_device_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device" ADD CONSTRAINT "device_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_has_media" ADD CONSTRAINT "device_has_media_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_has_media" ADD CONSTRAINT "device_has_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
