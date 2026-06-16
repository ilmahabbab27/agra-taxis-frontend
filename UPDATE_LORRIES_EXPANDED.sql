UPDATE `lorries` 
SET `rate_table` = JSON_OBJECT(
  '7ft', JSON_OBJECT(
    'type', '7 FT',
    'windows', JSON_ARRAY(
      JSON_OBJECT('fromKm', 0, 'toKm', 50, 'rate', 2000, 'extraPerKm', 140, 'hillExtraPerKm', 10),
      JSON_OBJECT('fromKm', 50, 'toKm', 100, 'rate', 2500, 'extraPerKm', 160, 'hillExtraPerKm', 12),
      JSON_OBJECT('fromKm', 100, 'toKm', 200, 'rate', 3000, 'extraPerKm', 180, 'hillExtraPerKm', 15)
    ),
    'upDownNonHill', 120, 'upDownHill', 200, 'freeWaitingHours', 2, 'waitingChargePerHour', 500
  ),
  '8_5ft', JSON_OBJECT(
    'type', '8.5 FT',
    'windows', JSON_ARRAY(
      JSON_OBJECT('fromKm', 0, 'toKm', 50, 'rate', 2800, 'extraPerKm', 160, 'hillExtraPerKm', 10),
      JSON_OBJECT('fromKm', 50, 'toKm', 100, 'rate', 3500, 'extraPerKm', 180, 'hillExtraPerKm', 12),
      JSON_OBJECT('fromKm', 100, 'toKm', 200, 'rate', 4000, 'extraPerKm', 200, 'hillExtraPerKm', 15)
    ),
    'upDownNonHill', 130, 'upDownHill', 220, 'freeWaitingHours', 2, 'waitingChargePerHour', 600
  ),
  '10_5ft', JSON_OBJECT(
    'type', '10.5 FT',
    'windows', JSON_ARRAY(
      JSON_OBJECT('fromKm', 0, 'toKm', 50, 'rate', 4800, 'extraPerKm', 200, 'hillExtraPerKm', 12),
      JSON_OBJECT('fromKm', 50, 'toKm', 100, 'rate', 6000, 'extraPerKm', 230, 'hillExtraPerKm', 15),
      JSON_OBJECT('fromKm', 100, 'toKm', 200, 'rate', 7000, 'extraPerKm', 250, 'hillExtraPerKm', 18)
    ),
    'upDownNonHill', 170, 'upDownHill', 280, 'freeWaitingHours', 2, 'waitingChargePerHour', 700
  ),
  '12_5ft', JSON_OBJECT(
    'type', '12.5 FT',
    'windows', JSON_ARRAY(
      JSON_OBJECT('fromKm', 0, 'toKm', 50, 'rate', 6000, 'extraPerKm', 220, 'hillExtraPerKm', 12),
      JSON_OBJECT('fromKm', 50, 'toKm', 100, 'rate', 7500, 'extraPerKm', 250, 'hillExtraPerKm', 15),
      JSON_OBJECT('fromKm', 100, 'toKm', 200, 'rate', 8500, 'extraPerKm', 280, 'hillExtraPerKm', 18)
    ),
    'upDownNonHill', 180, 'upDownHill', 300, 'freeWaitingHours', 2, 'waitingChargePerHour', 700
  ),
  '14_5ft', JSON_OBJECT(
    'type', '14.5 FT',
    'windows', JSON_ARRAY(
      JSON_OBJECT('fromKm', 0, 'toKm', 50, 'rate', 8000, 'extraPerKm', 280, 'hillExtraPerKm', 12),
      JSON_OBJECT('fromKm', 50, 'toKm', 100, 'rate', 10000, 'extraPerKm', 320, 'hillExtraPerKm', 15),
      JSON_OBJECT('fromKm', 100, 'toKm', 200, 'rate', 11500, 'extraPerKm', 350, 'hillExtraPerKm', 20)
    ),
    'upDownNonHill', 210, 'upDownHill', 350, 'freeWaitingHours', 2, 'waitingChargePerHour', 800
  ),
  '16_5ft', JSON_OBJECT(
    'type', '16.5 FT',
    'windows', JSON_ARRAY(
      JSON_OBJECT('fromKm', 0, 'toKm', 50, 'rate', 8800, 'extraPerKm', 290, 'hillExtraPerKm', 12),
      JSON_OBJECT('fromKm', 50, 'toKm', 100, 'rate', 11000, 'extraPerKm', 330, 'hillExtraPerKm', 15),
      JSON_OBJECT('fromKm', 100, 'toKm', 200, 'rate', 12500, 'extraPerKm', 360, 'hillExtraPerKm', 20)
    ),
    'upDownNonHill', 220, 'upDownHill', 360, 'freeWaitingHours', 2, 'waitingChargePerHour', 800
  ),
  '18_5ft', JSON_OBJECT(
    'type', '18.5 FT',
    'windows', JSON_ARRAY(
      JSON_OBJECT('fromKm', 0, 'toKm', 50, 'rate', 12800, 'extraPerKm', 350, 'hillExtraPerKm', 15),
      JSON_OBJECT('fromKm', 50, 'toKm', 100, 'rate', 16000, 'extraPerKm', 400, 'hillExtraPerKm', 18),
      JSON_OBJECT('fromKm', 100, 'toKm', 200, 'rate', 18000, 'extraPerKm', 430, 'hillExtraPerKm', 22)
    ),
    'upDownNonHill', 280, 'upDownHill', 450, 'freeWaitingHours', 2, 'waitingChargePerHour', 800
  ),
  '20ft', JSON_OBJECT(
    'type', '20 FT',
    'windows', JSON_ARRAY(
      JSON_OBJECT('fromKm', 0, 'toKm', 50, 'rate', 14400, 'extraPerKm', 400, 'hillExtraPerKm', 15),
      JSON_OBJECT('fromKm', 50, 'toKm', 100, 'rate', 18000, 'extraPerKm', 450, 'hillExtraPerKm', 20),
      JSON_OBJECT('fromKm', 100, 'toKm', 200, 'rate', 20000, 'extraPerKm', 480, 'hillExtraPerKm', 25)
    ),
    'upDownNonHill', 300, 'upDownHill', 500, 'freeWaitingHours', 2, 'waitingChargePerHour', 800
  ),
  '24ft', JSON_OBJECT(
    'type', '24 FT',
    'windows', JSON_ARRAY(
      JSON_OBJECT('fromKm', 0, 'toKm', 50, 'rate', 18000, 'extraPerKm', 450, 'hillExtraPerKm', 18),
      JSON_OBJECT('fromKm', 50, 'toKm', 100, 'rate', 22000, 'extraPerKm', 500, 'hillExtraPerKm', 22),
      JSON_OBJECT('fromKm', 100, 'toKm', 200, 'rate', 25000, 'extraPerKm', 550, 'hillExtraPerKm', 28)
    ),
    'upDownNonHill', 350, 'upDownHill', 550, 'freeWaitingHours', 2, 'waitingChargePerHour', 900
  )
)
WHERE `id` = 10;

-- Verify
SELECT `id`, `name`, JSON_KEYS(`rate_table`) AS 'Lorry Types'
FROM `lorries`
WHERE `id` = 10;
