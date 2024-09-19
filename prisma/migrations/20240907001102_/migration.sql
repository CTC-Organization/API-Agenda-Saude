/*
  Warnings:

  - The values [AVATAR] on the enum `AttachmentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "UploadType" AS ENUM ('AVATAR');

-- AlterEnum
BEGIN;
CREATE TYPE "AttachmentType_new" AS ENUM ('REQUEST_ATTACHMENT');
ALTER TABLE "attachments" ALTER COLUMN "type" TYPE "AttachmentType_new" USING ("type"::text::"AttachmentType_new");
ALTER TABLE "uploads" ALTER COLUMN "type" TYPE "AttachmentType_new" USING ("type"::text::"AttachmentType_new");
ALTER TYPE "AttachmentType" RENAME TO "AttachmentType_old";
ALTER TYPE "AttachmentType_new" RENAME TO "AttachmentType";
DROP TYPE "AttachmentType_old";
COMMIT;
