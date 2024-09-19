/*
  Warnings:

  - A unique constraint covering the columns `[sus_number]` on the table `patients` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "patients_sus_number_key" ON "patients"("sus_number");
