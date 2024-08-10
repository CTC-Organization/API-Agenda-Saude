/*
  Warnings:

  - Added the required column `name` to the `attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `attachments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('REQUEST_ATTACHMENT');

-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "type" "AttachmentType" NOT NULL;
