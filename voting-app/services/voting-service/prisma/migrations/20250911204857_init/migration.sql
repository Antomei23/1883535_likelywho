-- CreateTable
CREATE TABLE "votes"."Vote" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "votedUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vote_questionId_idx" ON "votes"."Vote"("questionId");

-- CreateIndex
CREATE INDEX "Vote_votedUserId_idx" ON "votes"."Vote"("votedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_questionId_voterId_key" ON "votes"."Vote"("questionId", "voterId");
