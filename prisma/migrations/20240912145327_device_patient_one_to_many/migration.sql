/*
  Warnings:

  - You are about to drop the `MobileDevice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MobileDevice" DROP CONSTRAINT "MobileDevice_patient_id_fkey";

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "mobile_device_id" TEXT;

-- DropTable
DROP TABLE "MobileDevice";

-- CreateTable
CREATE TABLE "mobile_devices" (
    "id" TEXT NOT NULL,
    "expo_token" TEXT NOT NULL,
    "device_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mobile_devices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_mobile_device_id_fkey" FOREIGN KEY ("mobile_device_id") REFERENCES "mobile_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
