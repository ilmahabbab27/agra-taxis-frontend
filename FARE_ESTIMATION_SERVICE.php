<?php

/**
 * Fare Estimation Service
 *
 * This service calculates passenger vehicle and lorry fares based on the
 * frontend estimation logic from BookingForm.tsx
 *
 * Usage in Laravel Controller:
 * $fareService = new FareEstimationService();
 * $estimate = $fareService->estimatePassengerFare($vehicleData, $tripDetails, $route);
 */

class FareEstimationService
{
    const INCLUDED_KM_PER_DAY = 150;
    const CURRENCY = 'LKR';

    const LORRY_DEFAULTS = [
        'maxUpDownKm' => 150,
        'dropMinKm' => 100,
        'dropMaxKm' => 130,
        'hillExtraPerKm' => 10,
    ];

    /**
     * Estimate fare for passenger vehicle
     *
     * @param array $vehicle Vehicle catalog item
     * @param array $tripDetails Trip configuration (tripType, days, acOption)
     * @param array $route Route information (distanceKm, isHillCountry)
     * @return array Estimation result
     */
    public function estimatePassengerFare(array $vehicle, array $tripDetails, array $route): array
    {
        // Validation
        $this->validatePassengerRequest($vehicle, $tripDetails, $route);

        // Extract values
        $totalKm = $route['distanceKm'];
        $days = max(1, intval($tripDetails['days'] ?? 1));
        $acOption = $tripDetails['acOption'] ?? 'AC';
        $isHillCountry = $route['isHillCountry'] ?? false;

        // Calculate included and billable km
        $includedKm = $days * self::INCLUDED_KM_PER_DAY;
        $billableKm = min($totalKm, $includedKm);
        $additionalKm = max(0, $totalKm - $includedKm);

        // Get price per km based on AC option and hill country
        $pricePerKm = $this->getPricePerKm($vehicle, $acOption, $isHillCountry);

        // Get package charge
        $packageCharge = $this->getPackageCharge($vehicle, $days, $acOption, $isHillCountry);

        // Calculate distance charges
        if ($days === 1) {
            $includedDistanceCharge = $packageCharge ?? ($billableKm * $pricePerKm);
        } else {
            $includedDistanceCharge = $packageCharge ?? ($billableKm * $pricePerKm);
        }

        $additionalDistanceCharge = $additionalKm * $pricePerKm;

        // Package 1 (Daily package with included km)
        $package1DayCharge = $pricePerKm * self::INCLUDED_KM_PER_DAY;
        $package1BaseCharge = $package1DayCharge * $days;
        $package1Estimate = $package1BaseCharge + $additionalDistanceCharge;

        // Package 2 (Pure distance-based pricing)
        $package2Estimate = $totalKm * $pricePerKm;

        // Recommendation: Package 1 for single day, otherwise calculate based on usage
        $recommendedFare = $package1Estimate;
        $recommendedPackage = 'package1';

        // If package 2 is cheaper, recommend it
        if ($package2Estimate < $package1Estimate) {
            $recommendedFare = $package2Estimate;
            $recommendedPackage = 'package2';
        }

        return [
            'success' => true,
            'data' => [
                'estimatedFare' => round($recommendedFare),
                'breakdown' => [
                    'package1' => [
                        'estimate' => round($package1Estimate),
                        'description' => "Day package ({self::INCLUDED_KM_PER_DAY}km included per day)",
                        'calculation' => [
                            'dailyPackageCharge' => round($package1DayCharge),
                            'days' => $days,
                            'packageBaseCharge' => round($package1BaseCharge),
                            'additionalKm' => round($additionalKm, 1),
                            'additionalKmCharge' => round($additionalDistanceCharge),
                            'total' => round($package1Estimate),
                        ],
                    ],
                    'package2' => [
                        'estimate' => round($package2Estimate),
                        'description' => 'Pure distance-based (per km)',
                        'calculation' => [
                            'distanceKm' => $totalKm,
                            'ratePerKm' => $pricePerKm,
                            'total' => round($package2Estimate),
                        ],
                    ],
                ],
                'packageRecommendation' => $recommendedPackage,
                'pricePerKm' => $pricePerKm,
                'hillCountrySurcharge' => $isHillCountry,
                'includedKm' => $includedKm,
                'totalDistance' => $totalKm,
                'billableKm' => round($billableKm, 1),
                'additionalKm' => round($additionalKm, 1),
                'days' => $days,
                'currency' => self::CURRENCY,
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'estimationType' => 'passenger',
                'vehicleName' => $vehicle['name'] ?? 'Unknown',
                'tripType' => $tripDetails['tripType'] ?? 'One Way',
                'acOption' => $acOption,
            ],
        ];
    }

    /**
     * Estimate fare for lorry service
     *
     * @param array $lorryRates Lorry rate table
     * @param array $tripDetails Trip configuration (tripType, days)
     * @param array $route Route information (distanceKm, isHillCountry)
     * @return array Estimation result
     */
    public function estimateLorryFare(array $lorryRates, array $tripDetails, array $route): array
    {
        // Validation
        $this->validateLorryRequest($lorryRates, $tripDetails, $route);

        // Extract values
        $totalKm = $route['distanceKm'];
        $tripType = $tripDetails['tripType'] ?? 'One Way';
        $days = max(1, intval($tripDetails['days'] ?? 1));
        $isHillCountry = $route['isHillCountry'] ?? false;
        $isRoundTrip = $tripType === 'Round Trip';

        // Apply defaults
        $rates = array_merge(self::LORRY_DEFAULTS, $lorryRates);

        // Calculate start charge based on trip type and distance
        $startCharge = 0;
        $extraKm = 0;
        $extraCharge = 0;
        $applicableRule = 'unknown';

        if ($isRoundTrip) {
            if ($totalKm <= $rates['maxUpDownKm']) {
                $startCharge = $rates['upDown'] ?? $rates['start'];
                $applicableRule = 'round_trip_up_down';
            } else {
                $startCharge = $rates['upDown'] ?? $rates['start'];
                $extraKm = max($totalKm - $rates['maxUpDownKm'], 0);
                $extraCharge = $extraKm * $rates['extra'];
                $applicableRule = 'round_trip_extra';
            }
        } else {
            // One Way
            if ($totalKm >= 100 && $totalKm <= 130 && isset($rates['between100And130'])) {
                $startCharge = $rates['between100And130'];
                $applicableRule = 'between_100_130';
            } elseif ($totalKm <= $rates['dropMaxKm']) {
                $startCharge = $rates['start'];
                $applicableRule = 'standard_drop';
            } else {
                $startCharge = $rates['start'];
                $extraKm = max($totalKm - $rates['dropMaxKm'], 0);
                $extraCharge = $extraKm * $rates['extra'];
                $applicableRule = 'extra_km_drop';
            }
        }

        // Calculate hill country surcharge
        $hillCharge = $isHillCountry ? ($totalKm * $rates['hillExtraPerKm']) : 0;

        // Calculate base fare
        $baseFare = $startCharge + $extraCharge + $hillCharge;

        // Apply day multiplier (lorry is typically 1 day service)
        $finalFare = $days === 1 ? $baseFare : ($baseFare * $days);

        return [
            'success' => true,
            'data' => [
                'estimatedFare' => round($finalFare),
                'breakdown' => [
                    'startCharge' => round($startCharge),
                    'extraKm' => round($extraKm, 1),
                    'extraKmCharge' => round($extraCharge),
                    'hillSurcharge' => round($hillCharge),
                    'total' => round($finalFare),
                ],
                'priceDetails' => [
                    'lorryType' => $rates['type'] ?? 'Standard',
                    'startCharge' => round($startCharge),
                    'extraKmRate' => $rates['extra'],
                    'hillExtraPerKm' => $rates['hillExtraPerKm'],
                    'totalKm' => $totalKm,
                    'hillSurchargeCalculation' => $hillCharge > 0
                        ? "{$totalKm} km × Rs. {$rates['hillExtraPerKm']}/km = Rs. " . round($hillCharge)
                        : 'Not applicable',
                ],
                'tripType' => $tripType,
                'isRoundTrip' => $isRoundTrip,
                'applicablePricingRule' => $applicableRule,
                'distanceKm' => $totalKm,
                'daysMultiplier' => $days,
                'currency' => self::CURRENCY,
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'estimationType' => 'lorry',
                'lorrySize' => $rates['type'] ?? 'Unknown',
            ],
        ];
    }

    /**
     * Get price per km based on AC option and hill country
     */
    private function getPricePerKm(array $vehicle, string $acOption, bool $isHillCountry): float
    {
        if ($acOption === 'Non AC') {
            return $isHillCountry
                ? ($vehicle['nonAcHillPricePerKm'] ?? $vehicle['nonAcPricePerKm'] ?? 0)
                : ($vehicle['nonAcPricePerKm'] ?? 0);
        }

        return $isHillCountry
            ? ($vehicle['acHillPricePerKm'] ?? $vehicle['acPricePerKm'] ?? 0)
            : ($vehicle['acPricePerKm'] ?? 0);
    }

    /**
     * Get package charge from vehicle pricing table
     */
    private function getPackageCharge(array $vehicle, int $days, string $acOption, bool $isHillCountry): ?float
    {
        $dayKey = "day{$days}";
        $packageRow = $vehicle['package1Prices'][$dayKey] ?? null;

        if (!$packageRow) {
            return null;
        }

        if ($acOption === 'Non AC') {
            return $isHillCountry ? $packageRow['nonAcHill'] : $packageRow['nonAcNormal'];
        }

        return $isHillCountry ? $packageRow['acHill'] : $packageRow['acNormal'];
    }

    /**
     * Validate passenger fare request
     */
    private function validatePassengerRequest(array $vehicle, array $tripDetails, array $route): void
    {
        $required = [
            'vehicle.name' => $vehicle['name'] ?? null,
            'vehicle.acPricePerKm' => $vehicle['acPricePerKm'] ?? null,
            'route.distanceKm' => $route['distanceKm'] ?? null,
            'tripDetails.tripType' => $tripDetails['tripType'] ?? null,
        ];

        foreach ($required as $field => $value) {
            if ($value === null || $value === '') {
                throw new \InvalidArgumentException("Missing required field: {$field}");
            }
        }

        if ($route['distanceKm'] <= 0) {
            throw new \InvalidArgumentException('Distance must be greater than 0');
        }
    }

    /**
     * Validate lorry fare request
     */
    private function validateLorryRequest(array $lorryRates, array $tripDetails, array $route): void
    {
        $required = [
            'lorryRates.start' => $lorryRates['start'] ?? null,
            'lorryRates.extra' => $lorryRates['extra'] ?? null,
            'route.distanceKm' => $route['distanceKm'] ?? null,
        ];

        foreach ($required as $field => $value) {
            if ($value === null || $value === '') {
                throw new \InvalidArgumentException("Missing required field: {$field}");
            }
        }

        if ($route['distanceKm'] <= 0) {
            throw new \InvalidArgumentException('Distance must be greater than 0');
        }
    }
}

/**
 * Example Laravel Controller Usage
 */

/*
namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FareEstimationController extends Controller
{
    private $fareService;

    public function __construct(FareEstimationService $fareService)
    {
        $this->fareService = $fareService;
    }

    // POST /api/estimate-passenger-fare
    public function estimatePassengerFare(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'vehicle' => 'required|array',
                'vehicle.name' => 'required|string',
                'vehicle.acPricePerKm' => 'required|numeric',
                'tripDetails' => 'required|array',
                'tripDetails.tripType' => 'required|in:One Way,Round Trip',
                'tripDetails.days' => 'required|integer|min:1',
                'route' => 'required|array',
                'route.distanceKm' => 'required|numeric|gt:0',
                'route.isHillCountry' => 'required|boolean',
            ]);

            $result = $this->fareService->estimatePassengerFare(
                $validated['vehicle'],
                $validated['tripDetails'],
                $validated['route']
            );

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'ESTIMATION_ERROR',
                    'message' => $e->getMessage(),
                ],
            ], 400);
        }
    }

    // POST /api/estimate-lorry-fare
    public function estimateLorryFare(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'lorryRates' => 'required|array',
                'lorryRates.start' => 'required|numeric',
                'lorryRates.extra' => 'required|numeric',
                'tripDetails' => 'required|array',
                'tripDetails.tripType' => 'required|in:One Way,Round Trip',
                'route' => 'required|array',
                'route.distanceKm' => 'required|numeric|gt:0',
                'route.isHillCountry' => 'required|boolean',
            ]);

            $result = $this->fareService->estimateLorryFare(
                $validated['lorryRates'],
                $validated['tripDetails'],
                $validated['route']
            );

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'ESTIMATION_ERROR',
                    'message' => $e->getMessage(),
                ],
            ], 400);
        }
    }
}

// Add to routes/api.php:
// Route::post('/estimate-passenger-fare', [FareEstimationController::class, 'estimatePassengerFare']);
// Route::post('/estimate-lorry-fare', [FareEstimationController::class, 'estimateLorryFare']);
*/

?>
