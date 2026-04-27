-- AlterTable
ALTER TABLE "Disease" ADD COLUMN "clinicalPlaybook" JSONB;

-- AlterTable
ALTER TABLE "Investigation" ADD COLUMN "notes" TEXT;
