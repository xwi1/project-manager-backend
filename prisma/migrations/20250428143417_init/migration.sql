/*
  Warnings:

  - You are about to drop the column `cells` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Block" ALTER COLUMN "order" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "cells";

-- CreateTable
CREATE TABLE "Cell" (
    "id" SERIAL NOT NULL,
    "taskId" TEXT NOT NULL,
    "blockId" INTEGER NOT NULL,
    "value" TEXT,
    "type" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Cell_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
