-- AlterTable
ALTER TABLE `orderitem` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `table` ADD COLUMN `roomNumber` VARCHAR(191) NULL;
