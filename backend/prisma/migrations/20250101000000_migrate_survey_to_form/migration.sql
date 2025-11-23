-- Migration: Survey to Form
-- This migration converts existing Survey data to Form model

-- Step 1: Add new columns to surveys table (which will become forms)
ALTER TABLE "surveys" ADD COLUMN "slug" TEXT;
ALTER TABLE "surveys" ADD COLUMN "type" TEXT DEFAULT 'post_purchase';
ALTER TABLE "surveys" ADD COLUMN "description" TEXT;
ALTER TABLE "surveys" ADD COLUMN "isPublished" BOOLEAN DEFAULT false;
ALTER TABLE "surveys" ADD COLUMN "settings" JSONB;
ALTER TABLE "surveys" ADD COLUMN "metadata" JSONB;
ALTER TABLE "surveys" ADD COLUMN "publishedAt" DATETIME;

-- Step 2: Generate slugs for existing surveys
UPDATE "surveys" SET "slug" = LOWER(REPLACE(REPLACE(REPLACE("name", ' ', '-'), '--', '-'), '--', '-')) || '-' || SUBSTR("id", 1, 8) WHERE "slug" IS NULL;

-- Step 3: Make slug unique (create temporary unique constraint)
CREATE UNIQUE INDEX IF NOT EXISTS "surveys_slug_key" ON "surveys"("slug");

-- Step 4: Update steps: Add formId column and migrate data
ALTER TABLE "steps" ADD COLUMN "formId" TEXT;
UPDATE "steps" SET "formId" = "surveyId";

-- Step 5: Recreate foreign key for formId
-- First, drop old foreign key constraint (SQLite doesn't support DROP CONSTRAINT, so we'll recreate the table later if needed)
-- Actually, SQLite doesn't enforce foreign keys by default, so we can proceed

-- Step 6: Update survey_responses: Add formId column and migrate data
ALTER TABLE "survey_responses" ADD COLUMN "formId" TEXT;
UPDATE "survey_responses" SET "formId" = "surveyId";

-- Step 7: Add category to questions (optional field)
ALTER TABLE "questions" ADD COLUMN "category" TEXT;

-- Step 8: Rename tables
ALTER TABLE "surveys" RENAME TO "forms";
ALTER TABLE "survey_responses" RENAME TO "form_responses";

-- Step 9: Update indexes
DROP INDEX IF EXISTS "steps_surveyId_order_key";
CREATE UNIQUE INDEX IF NOT EXISTS "steps_formId_order_key" ON "steps"("formId", "order");

DROP INDEX IF EXISTS "survey_responses_email_surveyId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "form_responses_email_formId_key" ON "form_responses"("email", "formId");

CREATE INDEX IF NOT EXISTS "forms_slug_idx" ON "forms"("slug");
CREATE INDEX IF NOT EXISTS "forms_isActive_idx" ON "forms"("isActive");
CREATE INDEX IF NOT EXISTS "forms_isPublished_idx" ON "forms"("isPublished");

-- Step 10: Drop old columns (after migration is complete)
-- We'll keep surveyId columns for now as backup, they can be dropped manually later
-- ALTER TABLE "steps" DROP COLUMN "surveyId";
-- ALTER TABLE "form_responses" DROP COLUMN "surveyId";

