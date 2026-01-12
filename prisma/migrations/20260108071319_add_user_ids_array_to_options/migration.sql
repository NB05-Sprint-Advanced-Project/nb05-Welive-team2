/*
  Warnings:

  - The values [APPROVED,REJECTED] on the enum `ComplaintStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `commentId` on the `Complaints` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `Complaints` table. All the data in the column will be lost.
  - You are about to drop the column `commentId` on the `Notices` table. All the data in the column will be lost.
  - Added the required column `content` to the `Comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Comments` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `contact` on the `Users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ComplaintStatus_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED');
ALTER TABLE "public"."Complaints" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Complaints" ALTER COLUMN "status" TYPE "ComplaintStatus_new" USING ("status"::text::"ComplaintStatus_new");
ALTER TYPE "ComplaintStatus" RENAME TO "ComplaintStatus_old";
ALTER TYPE "ComplaintStatus_new" RENAME TO "ComplaintStatus";
DROP TYPE "public"."ComplaintStatus_old";
ALTER TABLE "Complaints" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Complaints" DROP CONSTRAINT "Complaints_commentId_fkey";

-- DropForeignKey
ALTER TABLE "Complaints" DROP CONSTRAINT "Complaints_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notices" DROP CONSTRAINT "Notices_commentId_fkey";

-- AlterTable
ALTER TABLE "Comments" ADD COLUMN     "complaintId" TEXT,
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "noticeId" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Complaints" DROP COLUMN "commentId",
DROP COLUMN "viewCount",
ADD COLUMN     "viewsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Notices" DROP COLUMN "commentId";

-- AlterTable
ALTER TABLE "Options" ADD COLUMN     "userIds" TEXT[];

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "contact",
ADD COLUMN     "contact" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "Notices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaints" ADD CONSTRAINT "Complaints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
