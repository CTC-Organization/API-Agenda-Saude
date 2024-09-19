/*
  Warnings:

  - Made the column `sus_number` on table `patients` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "patients" ALTER COLUMN "sus_number" SET NOT NULL;
