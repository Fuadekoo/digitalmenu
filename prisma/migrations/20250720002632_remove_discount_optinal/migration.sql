/*
  Warnings:

  - Made the column `discount` on table `product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `product` MODIFY `discount` DOUBLE NOT NULL DEFAULT 0;
