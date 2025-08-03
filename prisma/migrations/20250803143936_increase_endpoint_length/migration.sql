-- DropIndex
DROP INDEX `Subscription_endpoint_key` ON `subscription`;

-- AlterTable
ALTER TABLE `subscription` MODIFY `endpoint` TEXT NOT NULL;
