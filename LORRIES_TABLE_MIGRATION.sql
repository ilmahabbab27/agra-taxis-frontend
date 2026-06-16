-- Drop existing tables if needed (backup your data first!)
-- DROP TABLE IF EXISTS lorries;

-- Create lorries table
CREATE TABLE IF NOT EXISTS `lorries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL UNIQUE,
  `category` varchar(100) NOT NULL DEFAULT 'Lorries',
  `img` longtext NOT NULL,
  `img2` longtext,
  `img3` longtext,
  `img4` longtext,
  `img5` longtext,
  `seats` int unsigned NOT NULL DEFAULT 1,
  `ac_available` boolean NOT NULL DEFAULT false,
  `non_ac_available` boolean NOT NULL DEFAULT false,
  `rate_table` json NOT NULL COMMENT 'Stores lorry rate windows as JSON',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `category_idx` (`category`),
  KEY `name_idx` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data with correct window structure
INSERT INTO `lorries`
  (`name`, `category`, `img`, `seats`, `ac_available`, `non_ac_available`, `rate_table`)
VALUES (
  'Agra Lorry',
  'Lorries',
  '/assets/car.jpg',
  1,
  false,
  false,
  JSON_OBJECT(
    '7ft', JSON_OBJECT(
      'type', '7 FT',
      'windows', JSON_ARRAY(
        JSON_OBJECT('fromKm', 0, 'toKm', 130, 'rate', 2500, 'extraPerKm', 160, 'hillExtraPerKm', 10)
      ),
      'extraUpDownCharge', 120,
      'waitingChargePerHour', 600
    ),
    '8_5ft', JSON_OBJECT(
      'type', '8.5 FT',
      'windows', JSON_ARRAY(
        JSON_OBJECT('fromKm', 0, 'toKm', 130, 'rate', 3500, 'extraPerKm', 180, 'hillExtraPerKm', 10)
      ),
      'extraUpDownCharge', 130,
      'waitingChargePerHour', 700
    ),
    '10_5ft', JSON_OBJECT(
      'type', '10.5 FT',
      'windows', JSON_ARRAY(
        JSON_OBJECT('fromKm', 0, 'toKm', 130, 'rate', 6000, 'extraPerKm', 230, 'hillExtraPerKm', 10)
      ),
      'extraUpDownCharge', 170,
      'waitingChargePerHour', 800
    ),
    '12_5ft', JSON_OBJECT(
      'type', '12.5 FT',
      'windows', JSON_ARRAY(
        JSON_OBJECT('fromKm', 0, 'toKm', 130, 'rate', 7500, 'extraPerKm', 250, 'hillExtraPerKm', 10)
      ),
      'extraUpDownCharge', 180,
      'waitingChargePerHour', 800
    ),
    '14_5ft', JSON_OBJECT(
      'type', '14.5 FT',
      'windows', JSON_ARRAY(
        JSON_OBJECT('fromKm', 0, 'toKm', 130, 'rate', 10000, 'extraPerKm', 320, 'hillExtraPerKm', 10)
      ),
      'extraUpDownCharge', 210,
      'waitingChargePerHour', 1000
    ),
    '16_5ft', JSON_OBJECT(
      'type', '16.5 FT',
      'windows', JSON_ARRAY(
        JSON_OBJECT('fromKm', 0, 'toKm', 130, 'rate', 11000, 'extraPerKm', 330, 'hillExtraPerKm', 10)
      ),
      'extraUpDownCharge', 220,
      'waitingChargePerHour', 1000
    ),
    '18_5ft', JSON_OBJECT(
      'type', '18.5 FT',
      'windows', JSON_ARRAY(
        JSON_OBJECT('fromKm', 0, 'toKm', 130, 'rate', 15000, 'extraPerKm', 380, 'hillExtraPerKm', 10)
      ),
      'extraUpDownCharge', 270,
      'waitingChargePerHour', 1200
    ),
    '20ft', JSON_OBJECT(
      'type', '20 FT',
      'windows', JSON_ARRAY(
        JSON_OBJECT('fromKm', 0, 'toKm', 130, 'rate', 18000, 'extraPerKm', 450, 'hillExtraPerKm', 10)
      ),
      'extraUpDownCharge', 300,
      'waitingChargePerHour', 1500
    )
  )
) ON DUPLICATE KEY UPDATE `updated_at` = NOW();
