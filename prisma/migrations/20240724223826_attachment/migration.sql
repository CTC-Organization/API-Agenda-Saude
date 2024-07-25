/*
  Warnings:

  - Added the required column `size` to the `attachments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UploadType" AS ENUM ('SCHEDULE_REFERRAL_REQUEST');

-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "extension" TEXT,
ADD COLUMN     "size" TEXT NOT NULL;
