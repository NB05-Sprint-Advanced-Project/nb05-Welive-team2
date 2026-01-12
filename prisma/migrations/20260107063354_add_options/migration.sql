/*
  Warnings:

  - Added the required column `endDate` to the `Notices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Notices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notices" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Options" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "pollId" TEXT NOT NULL,

    CONSTRAINT "Options_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Options" ADD CONSTRAINT "Options_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
