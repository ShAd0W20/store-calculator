-- CreateIndex
CREATE INDEX "TimeWork_id_userId_start_end_idx" ON "TimeWork"("id", "userId", "start", "end");
