-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "doctor_name" TEXT,
ADD COLUMN     "latitude" TEXT,
ADD COLUMN     "longitude" TEXT,
ADD COLUMN     "specialty" TEXT,
ALTER COLUMN "date" DROP NOT NULL;
