/*
  Warnings:

  - A unique constraint covering the columns `[guestId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Subscription_guestId_key` ON `Subscription`(`guestId`);
