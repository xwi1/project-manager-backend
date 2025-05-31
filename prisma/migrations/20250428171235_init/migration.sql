-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "order" INTEGER,
ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
