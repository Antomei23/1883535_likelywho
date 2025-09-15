-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "themes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "QuestionRef" ADD COLUMN     "theme" TEXT;
