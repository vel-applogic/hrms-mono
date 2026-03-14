-- CreateEnum
CREATE TYPE "QuestionTypeEnum" AS ENUM ('mcq', 'trueOrFalse');

-- CreateTable
CREATE TABLE "question" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "type" "QuestionTypeEnum" NOT NULL,
    "answerOptions" JSONB NOT NULL,
    "correctAnswerKeys" TEXT[],
    "explanation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_has_theme" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "themeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_has_theme_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "question_has_theme" ADD CONSTRAINT "question_has_theme_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_has_theme" ADD CONSTRAINT "question_has_theme_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
