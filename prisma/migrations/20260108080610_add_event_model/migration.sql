/*
  Warnings:

  - You are about to drop the column `endDate` on the `Notices` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Notices` table. All the data in the column will be lost.
  - You are about to drop the `AdminOf` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Resident` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "AdminOf" DROP CONSTRAINT "AdminOf_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_userId_fkey";

-- DropForeignKey
ALTER TABLE "Complaints" DROP CONSTRAINT "Complaints_apartmentId_fkey";

-- DropForeignKey
ALTER TABLE "Complaints" DROP CONSTRAINT "Complaints_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notices" DROP CONSTRAINT "Notices_apartmentId_fkey";

-- DropForeignKey
ALTER TABLE "Notices" DROP CONSTRAINT "Notices_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "Polls" DROP CONSTRAINT "Polls_apartmentId_fkey";

-- DropForeignKey
ALTER TABLE "Polls" DROP CONSTRAINT "Polls_userId_fkey";

-- DropForeignKey
ALTER TABLE "Resident" DROP CONSTRAINT "Resident_apartmentId_fkey";

-- DropForeignKey
ALTER TABLE "Resident" DROP CONSTRAINT "Resident_userId_fkey";

-- AlterTable
ALTER TABLE "Notices" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ALTER COLUMN "isPinned" DROP DEFAULT,
ALTER COLUMN "viewCount" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Polls" ALTER COLUMN "status" DROP DEFAULT;

-- DropTable
DROP TABLE "AdminOf";

-- DropTable
DROP TABLE "Resident";

-- DropTable
DROP TABLE "Users";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "joinedStatus" "Status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Apartment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "officeNumber" TEXT NOT NULL,
    "buildingNumberFrom" INTEGER NOT NULL,
    "buildingNumberTo" INTEGER NOT NULL,
    "floorCountPerBuilding" INTEGER NOT NULL,
    "unitCountPerFloor" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Apartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserApartmentLink" (
    "userId" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,

    CONSTRAINT "UserApartmentLink_pkey" PRIMARY KEY ("userId","apartmentId")
);

-- CreateTable
CREATE TABLE "Address" (
    "userId" TEXT NOT NULL,
    "isHouseHolder" BOOLEAN NOT NULL,
    "unit" TEXT NOT NULL,
    "building" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Events" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "noticeId" TEXT NOT NULL,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_contact_key" ON "User"("contact");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_joinedStatus_idx" ON "User"("joinedStatus");

-- CreateIndex
CREATE INDEX "UserApartmentLink_apartmentId_idx" ON "UserApartmentLink"("apartmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Events_noticeId_key" ON "Events"("noticeId");

-- AddForeignKey
ALTER TABLE "UserApartmentLink" ADD CONSTRAINT "UserApartmentLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserApartmentLink" ADD CONSTRAINT "UserApartmentLink_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaints" ADD CONSTRAINT "Complaints_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaints" ADD CONSTRAINT "Complaints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Polls" ADD CONSTRAINT "Polls_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Polls" ADD CONSTRAINT "Polls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "Notices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notices" ADD CONSTRAINT "Notices_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notices" ADD CONSTRAINT "Notices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
