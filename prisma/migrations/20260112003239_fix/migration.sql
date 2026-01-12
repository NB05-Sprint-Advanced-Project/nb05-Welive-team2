/*
  Warnings:

  - You are about to drop the column `voteCount` on the `Options` table. All the data in the column will be lost.
  - Changed the type of `unit` on the `Address` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `building` on the `Address` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "ComplaintStatus" ADD VALUE 'REJECTED';

-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_userId_fkey";

-- DropForeignKey
ALTER TABLE "Complaints" DROP CONSTRAINT "Complaints_apartmentId_fkey";

-- DropForeignKey
ALTER TABLE "Complaints" DROP CONSTRAINT "Complaints_userId_fkey";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "unit",
ADD COLUMN     "unit" INTEGER NOT NULL,
DROP COLUMN "building",
ADD COLUMN     "building" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Complaints" ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "isPublic" DROP DEFAULT,
ALTER COLUMN "viewsCount" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Options" DROP COLUMN "voteCount";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "refreshToken" TEXT;

-- CreateIndex
CREATE INDEX "Comments_complaintId_idx" ON "Comments"("complaintId");

-- CreateIndex
CREATE INDEX "Comments_noticeId_idx" ON "Comments"("noticeId");

-- CreateIndex
CREATE INDEX "Complaints_apartmentId_idx" ON "Complaints"("apartmentId");

-- CreateIndex
CREATE INDEX "Complaints_userId_idx" ON "Complaints"("userId");

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaints" ADD CONSTRAINT "Complaints_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaints" ADD CONSTRAINT "Complaints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
