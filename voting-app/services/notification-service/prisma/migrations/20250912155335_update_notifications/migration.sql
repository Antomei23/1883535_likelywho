-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "questionId" TEXT;

-- CreateIndex
CREATE INDEX "Notification_groupId_idx" ON "Notification"("groupId");

-- CreateIndex
CREATE INDEX "Notification_questionId_idx" ON "Notification"("questionId");
