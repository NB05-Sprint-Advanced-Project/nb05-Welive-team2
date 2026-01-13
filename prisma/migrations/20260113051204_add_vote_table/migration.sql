/*
  Warnings:

  - You are about to drop the column `userIds` on the `Options` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Options" DROP COLUMN "userIds";

-- CreateTable
CREATE TABLE "UserVoteOption" (
    "createdAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "UserVoteOption_pkey" PRIMARY KEY ("userId","optionId")
);

-- CreateIndex
CREATE INDEX "UserVoteOption_optionId_idx" ON "UserVoteOption"("optionId");

-- AddForeignKey
ALTER TABLE "UserVoteOption" ADD CONSTRAINT "UserVoteOption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVoteOption" ADD CONSTRAINT "UserVoteOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
