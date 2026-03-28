/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Doctor" ADD COLUMN     "password" TEXT,
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_userId_key" ON "public"."Doctor"("userId");
