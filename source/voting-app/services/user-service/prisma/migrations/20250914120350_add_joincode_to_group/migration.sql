/*
  Warnings:

  - A unique constraint covering the columns `[joinCode]` on the table `Group` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "joinCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Group_joinCode_key" ON "Group"("joinCode");
