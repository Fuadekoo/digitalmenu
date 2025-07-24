-- AlterTable
ALTER TABLE `table` ADD COLUMN `socket` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `socket` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `notification` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `fromUserId` VARCHAR(191) NULL,
    `fromTableId` VARCHAR(191) NULL,
    `toUserId` VARCHAR(191) NULL,
    `toTableId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_fromUserId_fkey` FOREIGN KEY (`fromUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_fromTableId_fkey` FOREIGN KEY (`fromTableId`) REFERENCES `table`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_toUserId_fkey` FOREIGN KEY (`toUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_toTableId_fkey` FOREIGN KEY (`toTableId`) REFERENCES `table`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
