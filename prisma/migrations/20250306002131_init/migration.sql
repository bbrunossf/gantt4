-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taskName" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "parentId" INTEGER,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "isMilestone" BOOLEAN NOT NULL DEFAULT false,
    "predecessor" TEXT,
    "uniqueID" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "Task_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskDependency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taskId" INTEGER NOT NULL,
    "predecessorId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "TaskDependency_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TaskDependency_predecessorId_fkey" FOREIGN KEY ("predecessorId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_uniqueID_key" ON "Task"("uniqueID");

-- CreateIndex
CREATE INDEX "TaskDependency_taskId_idx" ON "TaskDependency"("taskId");

-- CreateIndex
CREATE INDEX "TaskDependency_predecessorId_idx" ON "TaskDependency"("predecessorId");
