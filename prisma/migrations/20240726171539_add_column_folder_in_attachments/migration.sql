/*
  Warnings:

  - Added the required column `folder` to the `attachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "folder" TEXT NOT NULL;
