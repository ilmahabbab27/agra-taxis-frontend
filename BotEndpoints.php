<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Bot Endpoints - Two Simple Endpoints for Chatbot Integration
 *
 * Routes:
 * POST /bot/location - Validate/get location details
 * POST /bot/calculate - Calculate fare
 */

class BotController extends Controller
{
    /**
     * Endpoint 1: Location Validation
     *
     * POST /bot/location
     * {
     *   "location": "colmbo",
     *   "type": "pickup"  // or "destination"
     * }
     *
     * Response: Location details + coordinates + isHillCountry
     */
    public function location(Request $request): JsonResponse
    {
        try {
            $locationInput = trim($request->input('location', ''));
            $type = $request->input('type', 'pickup');

            if (empty($locationInput)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Location cannot be empty'
                ]);
            }

            // Get location service
            $locationService = new \LocationPredictorService();

            // Validate location
            $result = $locationService->validateLocation($locationInput);

            if (!$result['success']) {
                // Return suggestions if location not found
                return response()->json([
                    'success' => false,
                    'message' => $result['message'],
                    'suggestions' => $result['suggestions'] ?? []
                ]);
            }

            // Return location data
            return response()->json([
                'success' => true,
                'location' => $result['corrected'],
                'coordinates' => $result['data']['coordinates'],
                'isHillCountry' => $result['data']['isHillCountry'],
                'district' => $result['data']['district'],
                'confidence' => $result['confidence']
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error validating location',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Endpoint 2: Fare Calculation
     *
     * POST /bot/calculate
     * {
     *   "serviceType": "Passenger",  // or "Lorry"
     *   "pickup": "Colombo",
     *   "destination": "Kandy",
     *   "vehicle": "Toyota Hiace",     // for Passenger
     *   "lorryType": "7ft",            // for Lorry
     *   "passengers": 5,               // for Passenger
     *   "acOption": "AC",              // for Passenger
     *   "days": 1,
     *   "tripType": "One Way"
     * }
     *
     * Response: Calculated fare + breakdown
     */
    public function calculate(Request $request): JsonResponse
    {
        try {
            $serviceType = $request->input('serviceType', 'Passenger');
            $pickup = $request->input('pickup');
            $destination = $request->input('destination');

            if (!$pickup || !$destination) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pickup and destination are required'
                ]);
            }

            // Get location service
            $locationService = new \LocationPredictorService();

            // Validate both locations first
            $pickupValidation = $locationService->validateLocation($pickup);
            $destValidation = $locationService->validateLocation($destination);

            if (!$pickupValidation['success'] || !$destValidation['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid pickup or destination location'
                ]);
            }

            // Calculate distance using validated locations
            $distanceResult = $locationService->calculateDistance(
                $pickupValidation['corrected'],
                $destValidation['corrected']
            );

            if (!$distanceResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Could not calculate distance between locations'
                ]);
            }

            // Get fare service
            $fareService = new \FareEstimationService();

            // Calculate based on service type
            if ($serviceType === 'Lorry') {
                return $this->calculateLorryFare($request, $distanceResult, $fareService);
            } else {
                return $this->calculatePassengerFare($request, $distanceResult, $fareService);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error calculating fare',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate Passenger Fare
     */
    private function calculatePassengerFare(Request $request, $distanceResult, $fareService): JsonResponse
    {
        $vehicleName = $request->input('vehicle', 'Toyota Hiace');
        $passengers = intval($request->input('passengers', 1));
        $acOption = $request->input('acOption', 'AC');
        $days = intval($request->input('days', 1));
        $tripType = $request->input('tripType', 'One Way');

        // Get vehicle data from database
        $vehicle = $this->getVehicle($vehicleName);

        if (!$vehicle) {
            return response()->json([
                'success' => false,
                'message' => 'Vehicle not found'
            ]);
        }

        // Prepare trip details
        $tripDetails = [
            'tripType' => $tripType,
            'days' => $days,
            'passengers' => $passengers,
            'acOption' => $acOption
        ];

        // Prepare route
        $route = [
            'distanceKm' => $distanceResult['distance_km'],
            'isHillCountry' => $distanceResult['is_hill_country_route']
        ];

        // Calculate fare
        $result = $fareService->estimatePassengerFare($vehicle, $tripDetails, $route);

        return response()->json([
            'success' => true,
            'serviceType' => 'Passenger',
            'estimatedFare' => $result['data']['estimatedFare'],
            'distance' => $distanceResult['distance_km'],
            'isHillCountry' => $distanceResult['is_hill_country_route'],
            'breakdown' => [
                'package1' => $result['data']['breakdown']['package1']['estimate'],
                'package2' => $result['data']['breakdown']['package2']['estimate'],
                'recommended' => $result['data']['breakdown'][$result['data']['packageRecommendation']]['estimate']
            ],
            'pricePerKm' => $result['data']['pricePerKm'],
            'vehicle' => $vehicleName,
            'passengers' => $passengers,
            'acOption' => $acOption,
            'days' => $days
        ]);
    }

    /**
     * Calculate Lorry Fare
     */
    private function calculateLorryFare(Request $request, $distanceResult, $fareService): JsonResponse
    {
        $lorryType = $request->input('lorryType', '7ft');
        $tripType = $request->input('tripType', 'One Way');
        $days = intval($request->input('days', 1));

        // Get lorry rates from database
        $lorryRates = $this->getLorryRates($lorryType);

        if (!$lorryRates) {
            return response()->json([
                'success' => false,
                'message' => 'Lorry type not found'
            ]);
        }

        // Prepare trip details
        $tripDetails = [
            'tripType' => $tripType,
            'days' => $days
        ];

        // Prepare route
        $route = [
            'distanceKm' => $distanceResult['distance_km'],
            'isHillCountry' => $distanceResult['is_hill_country_route']
        ];

        // Calculate fare
        $result = $fareService->estimateLorryFare($lorryRates, $tripDetails, $route);

        return response()->json([
            'success' => true,
            'serviceType' => 'Lorry',
            'estimatedFare' => $result['data']['estimatedFare'],
            'distance' => $distanceResult['distance_km'],
            'isHillCountry' => $distanceResult['is_hill_country_route'],
            'breakdown' => [
                'startCharge' => $result['data']['breakdown']['startCharge'],
                'extraKmCharge' => $result['data']['breakdown']['extraKmCharge'],
                'hillSurcharge' => $result['data']['breakdown']['hillSurcharge'],
                'total' => $result['data']['breakdown']['total']
            ],
            'lorryType' => $lorryRates['type'],
            'tripType' => $tripType,
            'days' => $days
        ]);
    }

    /**
     * Get vehicle from database
     */
    private function getVehicle($name): ?array
    {
        // TODO: Replace with actual database query
        // DB::table('vehicles')->where('name', $name)->first();

        $vehicles = [
            'Toyota Hiace' => [
                'name' => 'Toyota Hiace',
                'seats' => 14,
                'acPricePerKm' => 180,
                'acHillPricePerKm' => 220,
                'nonAcPricePerKm' => 150,
                'nonAcHillPricePerKm' => 180,
                'acAvailable' => true,
                'nonAcAvailable' => true,
                'package1Prices' => [
                    'day1' => ['acNormal' => 15000, 'acHill' => 18000, 'nonAcNormal' => 12000, 'nonAcHill' => 14000],
                    'day2' => ['acNormal' => 28000, 'acHill' => 33000, 'nonAcNormal' => 22000, 'nonAcHill' => 26000]
                ]
            ],
            'Toyota Aqua' => [
                'name' => 'Toyota Aqua',
                'seats' => 5,
                'acPricePerKm' => 120,
                'acHillPricePerKm' => 150,
                'nonAcPricePerKm' => 100,
                'nonAcHillPricePerKm' => 130,
                'acAvailable' => true,
                'nonAcAvailable' => true,
                'package1Prices' => [
                    'day1' => ['acNormal' => 10000, 'acHill' => 12000, 'nonAcNormal' => 8000, 'nonAcHill' => 10000]
                ]
            ]
        ];

        return $vehicles[$name] ?? null;
    }

    /**
     * Get lorry rates from database
     */
    private function getLorryRates($type): ?array
    {
        // TODO: Replace with actual database query
        // DB::table('lorry_rates')->where('type', $type)->first();

        $rates = [
            '7ft' => [
                'type' => '7 FT',
                'start' => 2500,
                'extra' => 160,
                'upDown' => 120,
                'between100And130' => 2500,
                'maxUpDownKm' => 150,
                'dropMinKm' => 100,
                'dropMaxKm' => 130,
                'hillExtraPerKm' => 10
            ],
            '10.5ft' => [
                'type' => '10.5 FT',
                'start' => 6000,
                'extra' => 230,
                'upDown' => 170,
                'between100And130' => 4500,
                'maxUpDownKm' => 150,
                'dropMinKm' => 100,
                'dropMaxKm' => 130,
                'hillExtraPerKm' => 10
            ]
        ];

        return $rates[$type] ?? null;
    }
}

?>
