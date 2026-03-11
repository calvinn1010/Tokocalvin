-- Migration: Add fine columns to rentals table
-- Run this after updating the schema.sql

USE music_rental_db;

-- Add fine-related columns to rentals table
ALTER TABLE `rentals`
ADD COLUMN `late_fee_per_day` DECIMAL(10,2) DEFAULT 0.00 AFTER `rejection_reason`,
ADD COLUMN `late_days` INT DEFAULT 0 AFTER `late_fee_per_day`,
ADD COLUMN `late_fee_total` DECIMAL(10,2) DEFAULT 0.00 AFTER `late_days`;

-- Update existing records with default fine settings
UPDATE `rentals` SET `late_fee_per_day` = 10000 WHERE `late_fee_per_day` = 0;