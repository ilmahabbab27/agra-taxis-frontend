<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\LocationPredictorService;
use App\Services\FareEstimationService;

/**
 * Chatbot Controller
 *
 * Handles all chatbot messaging and conversation flow
 *
 * Routes:
 * POST /chatbot/message - Handle user messages
 * POST /chatbot/estimate - Get fare estimation
 */

class ChatbotController extends Controller
{
    private $locationService;
    private $fareService;
    private $sessionKey = 'chatbot_session';

    public function __construct(
        LocationPredictorService $locationService,
        FareEstimationService $fareService
    ) {
        $this->locationService = $locationService;
        $this->fareService = $fareService;
    }

    /**
     * Handle chatbot messages
     *
     * POST /chatbot/message
     * {
     *   "user_id": "user123",
     *   "message": "colmbo",
     *   "context": "asking_pickup_location"
     * }
     */
    public function message(Request $request): JsonResponse
    {
        try {
            $userId = $request->input('user_id', 'anonymous');
            $userMessage = trim($request->input('message', ''));
            $context = $request->input('context', ''); // Current conversation step
            $sessionData = $request->input('session', []); // Carry over session data

            if (empty($userMessage)) {
                return response()->json([
                    'success' => false,
                    'error' => 'EMPTY_MESSAGE',
                    'reply' => 'Please enter a message'
                ]);
            }

            // Route message based on context
            $response = match ($context) {
                'asking_service_type' => $this->handleServiceType($userMessage, $sessionData),
                'asking_pickup_location' => $this->handleLocationInput($userMessage, $sessionData, 'pickup'),
                'asking_destination_location' => $this->handleLocationInput($userMessage, $sessionData, 'destination'),
                'asking_passengers' => $this->handlePassengerCount($userMessage, $sessionData),
                'asking_ac_option' => $this->handleAcOption($userMessage, $sessionData),
                'asking_date' => $this->handleDate($userMessage, $sessionData),
                'asking_confirm' => $this->handleConfirmation($userMessage, $sessionData),
                'initial' => $this->handleInitial($userMessage, $sessionData),
                default => $this->handleInitial($userMessage, $sessionData),
            };

            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'SERVER_ERROR',
                'reply' => 'Something went wrong. Please try again.',
                'debug' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get fare estimation
     *
     * POST /chatbot/estimate
     * {
     *   "serviceType": "Passenger",
     *   "vehicle": "Toyota Hiace",
     *   "pickupLocation": "Colombo",
     *   "destinationLocation": "Kandy",
     *   "passengers": 5,
     *   "acOption": "AC",
     *   "days": 1,
     *   "tripType": "One Way"
     * }
     */
    public function estimate(Request $request): JsonResponse
    {
        try {
            $serviceType = $request->input('serviceType', 'Passenger');
            $pickupLocation = $request->input('pickupLocation');
            $destinationLocation = $request->input('destinationLocation');

            // Validate locations
            if (!$pickupLocation || !$destinationLocation) {
                return response()->json([
                    'success' => false,
                    'error' => 'MISSING_LOCATIONS',
                    'reply' => 'Please provide both pickup and destination locations'
                ]);
            }

            // Get distance between locations
            $distanceResult = $this->locationService->calculateDistance($pickupLocation, $destinationLocation);

            if (!$distanceResult['success']) {
                return response()->json([
                    'success' => false,
                    'error' => 'LOCATION_ERROR',
                    'reply' => 'Could not calculate distance between locations'
                ]);
            }

            $distance = $distanceResult['distance_km'];
            $isHillCountry = $distanceResult['is_hill_country_route'];

            // Estimate based on service type
            if ($serviceType === 'Lorry') {
                return $this->estimateLorryFare($request, $distanceResult);
            } else {
                return $this->estimatePassengerFare($request, $distanceResult);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'ESTIMATION_ERROR',
                'reply' => 'Could not calculate fare estimate',
                'debug' => $e->getMessage()
            ], 500);
        }
    }

    // ======== CONVERSATION HANDLERS ========

    private function handleInitial($message, $sessionData): array
    {
        $lower = strtolower($message);

        // Detect service type from initial message
        if (strpos($lower, 'passenger') !== false || strpos($lower, 'people') !== false || strpos($lower, 'travel') !== false) {
            return $this->handleServiceType('Passenger', $sessionData);
        }

        if (strpos($lower, 'lorry') !== false || strpos($lower, 'cargo') !== false || strpos($lower, 'goods') !== false) {
            return $this->handleServiceType('Lorry', $sessionData);
        }

        // Ask for service type
        return [
            'success' => true,
            'reply' => '👋 Welcome to Agra Connect! What would you like?
1️⃣ **Passenger Transport** - Travel with people
2️⃣ **Lorry Service** - Transport cargo/goods',
            'next_context' => 'asking_service_type',
            'session' => $sessionData
        ];
    }

    private function handleServiceType($message, $sessionData): array
    {
        $lower = strtolower(trim($message));
        $serviceType = match (true) {
            strpos($lower, 'passenger') !== false || strpos($lower, '1') !== false => 'Passenger',
            strpos($lower, 'lorry') !== false || strpos($lower, 'cargo') !== false || strpos($lower, '2') !== false => 'Lorry',
            default => null
        };

        if (!$serviceType) {
            return [
                'success' => false,
                'error' => 'INVALID_SERVICE_TYPE',
                'reply' => 'Please choose 1 (Passenger) or 2 (Lorry)',
                'next_context' => 'asking_service_type',
                'session' => $sessionData
            ];
        }

        $sessionData['serviceType'] = $serviceType;

        return [
            'success' => true,
            'reply' => $serviceType === 'Passenger'
                ? '🚗 Great! Where are you traveling from?'
                : '🚚 Got it! Where are you picking up from?',
            'next_context' => 'asking_pickup_location',
            'session' => $sessionData
        ];
    }

    private function handleLocationInput($message, $sessionData, $type): array
    {
        $location = trim($message);

        // Validate location
        $validation = $this->locationService->validateLocation($location);

        if (!$validation['success']) {
            if ($validation['error'] === 'AMBIGUOUS_LOCATION') {
                $suggestions = array_map(fn($s) => $s['name'], $validation['suggestions']);
                return [
                    'success' => false,
                    'error' => 'AMBIGUOUS_LOCATION',
                    'reply' => 'I found multiple locations: ' . implode(', ', $suggestions) . '. Which one?',
                    'suggestions' => $suggestions,
                    'next_context' => 'asking_' . $type . '_location',
                    'session' => $sessionData
                ];
            }

            $suggestions = $validation['suggestions'] ?? [];
            return [
                'success' => false,
                'error' => 'LOCATION_NOT_FOUND',
                'reply' => 'I couldn\'t find that location. Did you mean: ' .
                    implode(', ', array_map(fn($s) => $s['name'], array_slice($suggestions, 0, 3))) . '?',
                'suggestions' => array_map(fn($s) => $s['name'], array_slice($suggestions, 0, 3)),
                'next_context' => 'asking_' . $type . '_location',
                'session' => $sessionData
            ];
        }

        // Location validated
        $locationData = $validation['data'];
        $sessionData[$type . 'Location'] = $locationData['name'];
        $sessionData[$type . 'HillCountry'] = $locationData['isHillCountry'];

        // Determine next step
        if ($type === 'pickup') {
            $nextContext = 'asking_destination_location';
            $nextReply = '📍 Great! Now, where are you going?';
        } else {
            // Calculate if distance needs special handling
            if (!empty($sessionData['pickupLocation'])) {
                $distanceResult = $this->locationService->calculateDistance(
                    $sessionData['pickupLocation'],
                    $locationData['name']
                );

                $sessionData['distance'] = $distanceResult['distance_km'] ?? null;
                $sessionData['isHillCountryRoute'] = $distanceResult['is_hill_country_route'] ?? false;
            }

            // Next question based on service type
            if ($sessionData['serviceType'] === 'Lorry') {
                $nextContext = 'asking_confirm';
                $nextReply = '📋 Let me calculate the fare for you...';
            } else {
                $nextContext = 'asking_passengers';
                $nextReply = '👥 How many passengers will be traveling?';
            }
        }

        return [
            'success' => true,
            'reply' => $nextReply,
            'next_context' => $nextContext,
            'session' => $sessionData
        ];
    }

    private function handlePassengerCount($message, $sessionData): array
    {
        $count = intval(trim($message));

        if ($count < 1 || $count > 60) {
            return [
                'success' => false,
                'error' => 'INVALID_PASSENGER_COUNT',
                'reply' => 'Please enter a valid number (1-60)',
                'next_context' => 'asking_passengers',
                'session' => $sessionData
            ];
        }

        $sessionData['passengers'] = $count;

        return [
            'success' => true,
            'reply' => '🌡️ Do you prefer AC or Non-AC?',
            'next_context' => 'asking_ac_option',
            'session' => $sessionData
        ];
    }

    private function handleAcOption($message, $sessionData): array
    {
        $lower = strtolower(trim($message));
        $acOption = match (true) {
            strpos($lower, 'ac') !== false || strpos($lower, '1') !== false => 'AC',
            strpos($lower, 'non') !== false || strpos($lower, '2') !== false => 'Non AC',
            default => null
        };

        if (!$acOption) {
            return [
                'success' => false,
                'error' => 'INVALID_AC_OPTION',
                'reply' => 'Please choose AC or Non-AC',
                'next_context' => 'asking_ac_option',
                'session' => $sessionData
            ];
        }

        $sessionData['acOption'] = $acOption;

        return [
            'success' => true,
            'reply' => '📅 How many days? (default: 1)',
            'next_context' => 'asking_date',
            'session' => $sessionData
        ];
    }

    private function handleDate($message, $sessionData): array
    {
        $days = intval(trim($message)) ?: 1;

        if ($days < 1 || $days > 30) {
            return [
                'success' => false,
                'error' => 'INVALID_DAYS',
                'reply' => 'Please enter valid number of days (1-30)',
                'next_context' => 'asking_date',
                'session' => $sessionData
            ];
        }

        $sessionData['days'] = $days;

        return [
            'success' => true,
            'reply' => '📋 Calculating your fare estimate...',
            'next_context' => 'asking_confirm',
            'session' => $sessionData
        ];
    }

    private function handleConfirmation($message, $sessionData): array
    {
        // Get fare estimate with current session data
        $estimateRequest = new Request([
            'serviceType' => $sessionData['serviceType'] ?? 'Passenger',
            'pickupLocation' => $sessionData['pickupLocation'] ?? '',
            'destinationLocation' => $sessionData['destinationLocation'] ?? '',
            'passengers' => $sessionData['passengers'] ?? 1,
            'acOption' => $sessionData['acOption'] ?? 'AC',
            'days' => $sessionData['days'] ?? 1,
            'tripType' => $sessionData['tripType'] ?? 'One Way',
            'vehicle' => $sessionData['vehicle'] ?? null,
            'lorryType' => $sessionData['lorryType'] ?? null
        ]);

        $estimateResponse = json_decode(
            $this->estimate($estimateRequest)->getContent(),
            true
        );

        if (!$estimateResponse['success']) {
            return [
                'success' => false,
                'error' => 'ESTIMATION_FAILED',
                'reply' => 'Could not calculate fare. Please try again.',
                'next_context' => 'initial',
                'session' => $sessionData
            ];
        }

        $fare = $estimateResponse['fare'] ?? $estimateResponse['estimatedFare'] ?? 0;

        $confirmMessage = "
🎯 **Your Estimate**
📍 {$sessionData['pickupLocation']} → {$sessionData['destinationLocation']}
💰 **Rs. " . number_format($fare) . "**
👥 Passengers: {$sessionData['passengers']}
🌡️ {$sessionData['acOption']}
📅 {$sessionData['days']} day(s)

Ready to book?
";

        $sessionData['estimatedFare'] = $fare;

        return [
            'success' => true,
            'reply' => trim($confirmMessage),
            'fare' => $fare,
            'next_context' => 'asking_final_confirmation',
            'session' => $sessionData,
            'actions' => [
                ['label' => '✅ Book Now', 'action' => 'book'],
                ['label' => '❌ Cancel', 'action' => 'cancel']
            ]
        ];
    }

    // ======== FARE ESTIMATION ========

    private function estimatePassengerFare(Request $request, $distanceResult): JsonResponse
    {
        try {
            // Get vehicle data (from database or request)
            $vehicleName = $request->input('vehicle', 'Toyota Hiace');
            $vehicle = $this->getVehicleData($vehicleName);

            if (!$vehicle) {
                return response()->json([
                    'success' => false,
                    'error' => 'VEHICLE_NOT_FOUND',
                    'reply' => 'Vehicle not found'
                ]);
            }

            $tripDetails = [
                'tripType' => $request->input('tripType', 'One Way'),
                'days' => intval($request->input('days', 1)),
                'passengers' => intval($request->input('passengers', 1)),
                'acOption' => $request->input('acOption', 'AC')
            ];

            $fareEstimate = $this->fareService->estimatePassengerFare(
                $vehicle,
                $tripDetails,
                [
                    'distanceKm' => $distanceResult['distance_km'],
                    'isHillCountry' => $distanceResult['is_hill_country_route']
                ]
            );

            return response()->json([
                'success' => true,
                'serviceType' => 'Passenger',
                'fare' => $fareEstimate['data']['estimatedFare'],
                'estimatedFare' => $fareEstimate['data']['estimatedFare'],
                'breakdown' => $fareEstimate['data']['breakdown'],
                'distance' => $distanceResult,
                'reply' => '💰 Fare estimate calculated successfully',
                'recommendation' => $fareEstimate['data']['packageRecommendation']
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'ESTIMATION_ERROR',
                'reply' => 'Could not estimate passenger fare',
                'debug' => $e->getMessage()
            ], 500);
        }
    }

    private function estimateLorryFare(Request $request, $distanceResult): JsonResponse
    {
        try {
            $lorryType = $request->input('lorryType', '7ft');
            $lorryRates = $this->getLorryRates($lorryType);

            if (!$lorryRates) {
                return response()->json([
                    'success' => false,
                    'error' => 'LORRY_TYPE_NOT_FOUND',
                    'reply' => 'Lorry type not found'
                ]);
            }

            $tripDetails = [
                'tripType' => $request->input('tripType', 'One Way'),
                'days' => intval($request->input('days', 1))
            ];

            $fareEstimate = $this->fareService->estimateLorryFare(
                $lorryRates,
                $tripDetails,
                [
                    'distanceKm' => $distanceResult['distance_km'],
                    'isHillCountry' => $distanceResult['is_hill_country_route']
                ]
            );

            return response()->json([
                'success' => true,
                'serviceType' => 'Lorry',
                'fare' => $fareEstimate['data']['estimatedFare'],
                'estimatedFare' => $fareEstimate['data']['estimatedFare'],
                'breakdown' => $fareEstimate['data']['breakdown'],
                'distance' => $distanceResult,
                'reply' => '💰 Lorry fare calculated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'ESTIMATION_ERROR',
                'reply' => 'Could not estimate lorry fare',
                'debug' => $e->getMessage()
            ], 500);
        }
    }

    // ======== DATABASE HELPERS ========

    private function getVehicleData($vehicleName): ?array
    {
        // In production, fetch from database
        // For now, return sample data
        $vehicles = [
            'Toyota Hiace' => [
                'name' => 'Toyota Hiace',
                'category' => 'Mini Buses',
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
            ]
        ];

        return $vehicles[$vehicleName] ?? null;
    }

    private function getLorryRates($lorryType): ?array
    {
        // In production, fetch from database
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
            ]
        ];

        return $rates[$lorryType] ?? null;
    }
}

?>
