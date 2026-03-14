-- CreateEnum
CREATE TYPE "candidateSource" AS ENUM ('email', 'googleSearch', 'lead', 'linkedin', 'referral', 'websiteForm');

-- CreateEnum
CREATE TYPE "noticePeriodUnit" AS ENUM ('days', 'weeks', 'months');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('new', 'planed', 'notReachable', 'selected', 'onHold', 'rejected');

-- CreateEnum
CREATE TYPE "CandidateProgress" AS ENUM ('new', 'infoCollected', 'lev1InterviewScheduled', 'lev1InterviewCompleted', 'lev2InterviewScheduled', 'lev2InterviewCompleted', 'offerReleased', 'offerAccepted');

-- CreateEnum
CREATE TYPE "candidateMediaType" AS ENUM ('resume', 'offerLetter', 'otherDocuments');

-- CreateTable
CREATE TABLE "CandidateHasMedia" (
    "id" SERIAL NOT NULL,
    "candidate_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "type" "candidateMediaType" NOT NULL,

    CONSTRAINT "CandidateHasMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate" (
    "id" SERIAL NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactNumbers" TEXT[],
    "source" "candidateSource" NOT NULL,
    "urls" TEXT[],
    "expInYears" DOUBLE PRECISION NOT NULL,
    "relevantExpInYears" DOUBLE PRECISION NOT NULL,
    "skills" TEXT[],
    "currentCtcInLacs" DOUBLE PRECISION NOT NULL,
    "expectedCtcInLacs" DOUBLE PRECISION NOT NULL,
    "noticePeriod" DOUBLE PRECISION NOT NULL,
    "noticePeriodUnit" "noticePeriodUnit" NOT NULL,
    "status" "CandidateStatus" NOT NULL DEFAULT 'new',
    "progress" "CandidateProgress" NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateHasFeedback" (
    "id" SERIAL NOT NULL,
    "candidate_id" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateHasFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slide_has_media" (
    "id" SERIAL NOT NULL,
    "slide_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slide_has_media_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CandidateHasMedia" ADD CONSTRAINT "CandidateHasMedia_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateHasMedia" ADD CONSTRAINT "CandidateHasMedia_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateHasFeedback" ADD CONSTRAINT "CandidateHasFeedback_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slide_has_media" ADD CONSTRAINT "slide_has_media_slide_id_fkey" FOREIGN KEY ("slide_id") REFERENCES "slide"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slide_has_media" ADD CONSTRAINT "slide_has_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
