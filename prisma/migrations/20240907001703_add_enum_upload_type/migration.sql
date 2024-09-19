/*
  Warnings:

  - Changed the type of `type` on the `uploads` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "uploads" DROP COLUMN "type",
ADD COLUMN     "type" "UploadType" NOT NULL;
