/*
  Warnings:

  - You are about to drop the column `socket` on the `table` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `table` DROP COLUMN `socket`;

-- CreateTable
CREATE TABLE `TableSocket` (
    `id` VARCHAR(191) NOT NULL,
    `tableId` VARCHAR(191) NOT NULL,
    `guestId` VARCHAR(191) NOT NULL,
    `socketId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TableSocket_socketId_key`(`socketId`),
    INDEX `TableSocket_tableId_idx`(`tableId`),
    INDEX `TableSocket_guestId_idx`(`guestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TableSocket` ADD CONSTRAINT `TableSocket_tableId_fkey` FOREIGN KEY (`tableId`) REFERENCES `table`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
