-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Question_groupId_idx" ON "Question"("groupId");

-- CreateIndex
CREATE INDEX "Question_expiresAt_idx" ON "Question"("expiresAt");
