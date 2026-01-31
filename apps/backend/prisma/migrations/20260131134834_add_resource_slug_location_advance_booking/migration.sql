/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `resources` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `resources` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "resources" ADD COLUMN     "advance_booking_limit_days" INTEGER DEFAULT 90,
ADD COLUMN     "location" VARCHAR(250),
ADD COLUMN     "slug" VARCHAR(250) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "resources_slug_key" ON "resources"("slug");
