/*
  Warnings:

  - You are about to drop the column `voteCount` on the `Votes` table. All the data in the column will be lost.
  - Added the required column `voteType` to the `Votes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Votes" DROP COLUMN "voteCount",
ADD COLUMN     "voteType" TEXT NOT NULL;
