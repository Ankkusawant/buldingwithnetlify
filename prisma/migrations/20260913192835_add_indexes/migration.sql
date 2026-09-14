/*
  Warnings:

  - A unique constraint covering the columns `[provider,providerTaskId]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "ProviderEvent_provider_status_createdAt_idx" ON "ProviderEvent"("provider", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Task_status_createdAt_idx" ON "Task"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Task_provider_status_idx" ON "Task"("provider", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Task_provider_providerTaskId_key" ON "Task"("provider", "providerTaskId");

-- CreateIndex
CREATE INDEX "TaskCompletion_userId_createdAt_idx" ON "TaskCompletion"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "TaskCompletion_taskId_status_idx" ON "TaskCompletion"("taskId", "status");

-- CreateIndex
CREATE INDEX "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Transaction_type_status_idx" ON "Transaction"("type", "status");

-- CreateIndex
CREATE INDEX "User_status_createdAt_idx" ON "User"("status", "createdAt");

-- CreateIndex
CREATE INDEX "User_referredById_idx" ON "User"("referredById");

-- CreateIndex
CREATE INDEX "Withdrawal_status_createdAt_idx" ON "Withdrawal"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Withdrawal_userId_createdAt_idx" ON "Withdrawal"("userId", "createdAt");
