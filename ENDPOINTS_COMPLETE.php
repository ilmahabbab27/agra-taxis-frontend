<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Complete Endpoints for Smart Booking Flow
 *
 * Routes needed:
 * GET    /api/vehicles                    - Get all vehicles
 * GET    /api/vehicles?passengers=5       - Filter by passenger count
 * POST   /api/locations/suggest          - Location autocomplete
 * POST   /api/bot/location               - Validate location
 * POST   /api/locations/distance         - Calculate distance
 * POST   /api/bot/calculate              - Calculate fare
 */

class BookingApiController extends Controller
{
    /**
     * ENDPOINT 1: Get Vehicles (with optional passenger count filter)
     *
     * GET /api/vehicles
     * GET /api/vehicles?passengers=5
     *
     * Response: All vehicles or filtered by passenger count
     */
    public function getVehicles(Request $request): JsonResponse
    {
        try {
            $passengers = $request->input('passengers');

            // Get all vehicles from database
            $query = Vehicle::all();

            // Filter by passenger count if provided
            if ($passengers) {
                $passengers = intval($passengers);
                $query = $query->filter(fn($v) => $v->seats >= $passengers);
            }

            return response()->json([
                'success' => true,
                'data' => $query->map(fn($v) => [
                    'id' => $v->id,
                    'name' => $v->name,
                    'seats' => $v->seats,
                    'category' => $v->category,
                    'acPricePerKm' => $v->ac_price_per_km,
                    'nonAcPricePerKm' => $v->non_ac_price_per_km,
                    'acAvailable' => $v->ac_available,
                    'nonAcAvailable' => $v->non_ac_available,
                    'package1Prices' => json_decode($v->package1_prices, true),
                ]),
                'count' => $query->count(),
                'filtered' => $passengers ? true : false,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch vehicles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ENDPOINT 2: Location Autocomplete
     *
     * POST /api/locations/suggest
     * {
     *   "query": "kan",
     *   "limit": 5
     * }
     *
     * Response: Suggested locations matching query
     */
    public function suggestLocations(Request $request): JsonResponse
    {
        try {
            $query = $request->input('query', '');
            $limit = intval($request->input('limit', 5));

            if (strlen($query) < 2) {
                return response()->json([
                    'success' => false,
                    'suggestions' => [],
                    'message' => 'Enter at least 2 characters'
                ]);
            }

            $locationService = new \LocationPredictorService();
            $result = $locationService->autocomplete($query, $limit);

            return response()->json([
                'success' => true,
                'query' => $query,
                'suggestions' => $result['suggestions'] ?? [],
                'count' => $result['count'] ?? 0,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Location search failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ENDPOINT 3: Validate & Get Location Details
     *
     * POST /api/bot/location
     * {
     *   "location": "colombo",
     *   "type": "pickup"
     * }
     *
     * Response: Validated location with coordinates and details
     */
    public function validateLocation(Request $request): JsonResponse
    {
        try {
            $location = trim($request->input('location', ''));
            $type = $request->input('type', 'pickup');

            if (empty($location)) {
                return response()->json([
                    'success' => false,
                    'error' => 'EMPTY_INPUT',
                    'message' => 'Location cannot be empty'
                ]);
            }

            $locationService = new \LocationPredictorService();
            $result = $locationService->validateLocation($location);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'error' => $result['error'] ?? 'LOCATION_NOT_FOUND',
                    'message' => $result['message'],
                    'suggestions' => $result['suggestions'] ?? []
                ]);
            }

            return response()->json([
                'success' => true,
                'location' => $result['corrected'],
                'coordinates' => $result['data']['coordinates'],
                'district' => $result['data']['district'],
                'isHillCountry' => $result['data']['isHillCountry'],
                'confidence' => $result['confidence']
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'VALIDATION_ERROR',
                'message' => 'Failed to validate location',
                'debug' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ENDPOINT 4: Calculate Distance Between Two Locations
     *
     * POST /api/locations/distance
     * {
     *   "from": "Colombo",
     *   "to": "Kandy"
     * }
     *
     * Response: Distance in km, route type, hill country info
     */
    public function calculateDistance(Request $request): JsonResponse
    {
        try {
            $from = trim($request->input('from', ''));
            $to = trim($request->input('to', ''));

            if (empty($from) || empty($to)) {
                return response()->json([
                    'success' => false,
                    'error' => 'MISSING_LOCATIONS',
                    'message' => 'Both locations are required'
                ]);
            }

            $locationService = new \LocationPredictorService();
            $result = $locationService->calculateDistance($from, $to);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'error' => 'DISTANCE_CALCULATION_FAILED',
                    'message' => 'Could not calculate distance'
                ]);
            }

            return response()->json([
                'success' => true,
                'from' => $result['from'],
                'to' => $result['to'],
                'distance_km' => $result['distance_km'],
                'is_hill_country_route' => $result['is_hill_country_route'],
                'estimated_travel_time_hours' => $result['estimated_travel_time_hours'],
                'pickup_hill_country' => $result['pickup_hill_country'],
                'destination_hill_country' => $result['destination_hill_country']
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'CALCULATION_ERROR',
                'message' => 'Failed to calculate distance',
                'debug' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ENDPOINT 5: Calculate Fare Estimate
     *
     * POST /api/bot/calculate
     * {
     *   "serviceType": "Passenger",
     *   "pickup": "Colombo",
     *   "destination": "Kandy",
     *   "vehicle": "Toyota Hiace",
     *   "passengers": 5,
     *   "acOption": "AC",
     *   "days": 1,
     *   "tripType": "One Way",
     *   "stops": ["Negombo"],
     *   "date": "2026-06-15",
     *   "time": "10:00"
     * }
     *
     * Response: Calculated fare with breakdown
     */
    public function calculateFare(Request $request): JsonResponse
    {
        try {
            $serviceType = $request->input('serviceType', 'Passenger');
            $pickup = $request->input('pickup');
            $destination = $request->input('destination');

            // Validate required fields
            if (!$pickup || !$destination) {
                return response()->json([
                    'success' => false,
                    'error' => 'MISSING_LOCATIONS',
                    'message' => 'Pickup and destination are required'
                ]);
            }

            // Get location service
            $locationService = new \LocationPredictorService();

            // Validate and get coordinates
            $pickupValidation = $locationService->validateLocation($pickup);
            $destValidation = $locationService->validateLocation($destination);

            if (!$pickupValidation['success'] || !$destValidation['success']) {
                return response()->json([
                    'success' => false,
                    'error' => 'INVALID_LOCATION',
                    'message' => 'Invalid pickup or destination location'
                ]);
            }

            // Calculate distance
            $distanceResult = $locationService->calculateDistance(
                $pickupValidation['corrected'],
                $destValidation['corrected']
            );

            if (!$distanceResult['success']) {
                return response()->json([
                    'success' => false,
                    'error' => 'DISTANCE_FAILED',
                    'message' => 'Could not calculate distance'
                ]);
            }

            // Get fare service
            $fareService = new \FareEstimationService();

            // Estimate based on service type
            if ($serviceType === 'Lorry') {
                return $this->calculateLorryFare($request, $distanceResult, $fareService);
            } else {
                return $this->calculatePassengerFare($request, $distanceResult, $fareService);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'CALCULATION_ERROR',
                'message' => 'Failed to calculate fare',
                'debug' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper: Calculate Passenger Fare
     */
    private function calculatePassengerFare(Request $request, $distanceResult, $fareService): JsonResponse
    {
        $vehicleName = $request->input('vehicle', 'Toyota Hiace');
        $passengers = intval($request->input('passengers', 1));
        $acOption = $request->input('acOption', 'AC');
        $days = intval($request->input('days', 1));
        $tripType = $request->input('tripType', 'One Way');

        // Get vehicle
        $vehicle = Vehicle::where('name', $vehicleName)->first();
        if (!$vehicle) {
            return response()->json([
                'success' => false,
                'error' => 'VEHICLE_NOT_FOUND',
                'message' => 'Vehicle not found'
            ]);
        }

        // Calculate fare
        $result = $fareService->estimatePassengerFare(
            $vehicle->toArray(),
            [
                'tripType' => $tripType,
                'days' => $days,
                'passengers' => $passengers,
                'acOption' => $acOption
            ],
            [
                'distanceKm' => $distanceResult['distance_km'],
                'isHillCountry' => $distanceResult['is_hill_country_route']
            ]
        );

        return response()->json([
            'success' => true,
            'serviceType' => 'Passenger',
            'estimatedFare' => $result['data']['estimatedFare'],
            'distance' => $distanceResult['distance_km'],
            'isHillCountry' => $distanceResult['is_hill_country_route'],
            'breakdown' => $result['data']['breakdown'],
            'pricePerKm' => $result['data']['pricePerKm'],
            'vehicle' => $vehicleName,
            'passengers' => $passengers,
            'acOption' => $acOption,
            'days' => $days,
            'tripType' => $tripType
        ]);
    }

    /**
     * Helper: Calculate Lorry Fare
     */
    private function calculateLorryFare(Request $request, $distanceResult, $fareService): JsonResponse
    {
        $lorryType = $request->input('lorryType', '7ft');
        $tripType = $request->input('tripType', 'One Way');
        $days = intval($request->input('days', 1));

        // Get lorry rates (from database or hardcoded)
        $lorryRates = $this->getLorryRates($lorryType);

        if (!$lorryRates) {
            return response()->json([
                'success' => false,
                'error' => 'LORRY_TYPE_NOT_FOUND',
                'message' => 'Lorry type not found'
            ]);
        }

        // Calculate fare
        $result = $fareService->estimateLorryFare(
            $lorryRates,
            [
                'tripType' => $tripType,
                'days' => $days
            ],
            [
                'distanceKm' => $distanceResult['distance_km'],
                'isHillCountry' => $distanceResult['is_hill_country_route']
            ]
        );

        return response()->json([
            'success' => true,
            'serviceType' => 'Lorry',
            'estimatedFare' => $result['data']['estimatedFare'],
            'distance' => $distanceResult['distance_km'],
            'isHillCountry' => $distanceResult['is_hill_country_route'],
            'breakdown' => $result['data']['breakdown'],
            'lorryType' => $lorryRates['type'],
            'tripType' => $tripType,
            'days' => $days
        ]);
    }

    /**
     * Helper: Get Lorry Rates
     */
    private function getLorryRates($type): ?array
    {
        $rates = [
            '7ft' => [
                'type' => '7 FT',
                'start' => 2500,
                'extra' => 160,
                'upDown' => 120,
                'between100And130' => 2500,
                'maxUpDownKm' => 150,
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
                'dropMaxKm' => 130,
                'hillExtraPerKm' => 10
            ],
            // Add more lorry types...
        ];

        return $rates[$type] ?? null;
    }
}

?>
