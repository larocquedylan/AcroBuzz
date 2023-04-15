/*
  Warnings:

  - You are about to drop the column `voteType` on the `Votes` table. All the data in the column will be lost.
  - Added the required column `voteValue` to the `Votes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "totalPoints" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Votes" DROP COLUMN "voteType",
ADD COLUMN     "voteValue" INTEGER NOT NULL;
