/*
  Warnings:

  - A unique constraint covering the columns `[guestId]` on the table `TableSocket` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `TableSocket_guestId_key` ON `TableSocket`(`guestId`);
