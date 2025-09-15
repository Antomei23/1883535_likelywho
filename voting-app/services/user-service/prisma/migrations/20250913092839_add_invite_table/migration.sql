-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedByUserId" TEXT,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invite_code_key" ON "Invite"("code");

-- CreateIndex
CREATE INDEX "Invite_groupId_idx" ON "Invite"("groupId");

-- CreateIndex
CREATE INDEX "Invite_code_idx" ON "Invite"("code");

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
