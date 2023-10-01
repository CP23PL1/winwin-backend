/*
  Warnings:

  - The primary key for the `ServiceSpot` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[name]` on the table `ServiceSpot` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `id` on the `ServiceSpot` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ServiceSpot" DROP CONSTRAINT "ServiceSpot_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "ServiceSpot_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceSpot_name_key" ON "ServiceSpot"("name");
