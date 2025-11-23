/*
  Warnings:

  - You are about to drop the `survey_responses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `surveys` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `surveyId` on the `steps` table. All the data in the column will be lost.
  - Added the required column `formId` to the `steps` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "survey_responses_email_surveyId_key";

-- AlterTable
ALTER TABLE "questions" ADD COLUMN "category" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "survey_responses";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "surveys";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "forms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'post_purchase',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "branding" JSONB NOT NULL,
    "settings" JSONB,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME
);

-- CreateTable
CREATE TABLE "form_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "responses" JSONB NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "form_responses_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "steps_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_steps" ("createdAt", "description", "id", "name", "order", "updatedAt") SELECT "createdAt", "description", "id", "name", "order", "updatedAt" FROM "steps";
DROP TABLE "steps";
ALTER TABLE "new_steps" RENAME TO "steps";
CREATE UNIQUE INDEX "steps_formId_order_key" ON "steps"("formId", "order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "forms_slug_key" ON "forms"("slug");

-- CreateIndex
CREATE INDEX "forms_slug_idx" ON "forms"("slug");

-- CreateIndex
CREATE INDEX "forms_isActive_idx" ON "forms"("isActive");

-- CreateIndex
CREATE INDEX "forms_isPublished_idx" ON "forms"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "form_responses_email_formId_key" ON "form_responses"("email", "formId");
