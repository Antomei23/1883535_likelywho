/*
  Warnings:

  - Added the required column `groupId` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "groupId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Vote_groupId_idx" ON "Vote"("groupId");
