<?php

/**
 * Location Predictor Service
 *
 * Provides location autocomplete, validation, and distance calculation
 * for chatbot integration.
 *
 * Usage:
 * $service = new LocationPredictorService();
 * $suggestions = $service->autocomplete('kan');
 * $validated = $service->validateLocation('colmbo');
 */

class LocationPredictorService
{
    private $locations = [];

    public function __construct()
    {
        $this->locations = $this->getLocations();
    }

    /**
     * Get autocomplete suggestions
     */
    public function autocomplete(string $query, int $limit = 5): array
    {
        $query = strtolower(trim($query));
        if (strlen($query) < 2) {
            return [
                'success' => false,
                'query' => $query,
                'suggestions' => [],
                'count' => 0,
                'message' => 'Enter at least 2 characters'
            ];
        }

        $suggestions = [];

        // First: Exact prefix matches
        foreach ($this->locations as $location) {
            if (strpos(strtolower($location['name']), $query) === 0) {
                $suggestions[] = [
                    'location' => $location,
                    'score' => 0.99,
                    'type' => 'prefix_match'
                ];
            }
        }

        // Second: Alternative name matches
        foreach ($this->locations as $location) {
            foreach ($location['alternatives'] ?? [] as $alt) {
                if (strpos(strtolower($alt), $query) === 0) {
                    if (!$this->locationExists($suggestions, $location['name'])) {
                        $suggestions[] = [
                            'location' => $location,
                            'score' => 0.95,
                            'type' => 'alternative_match'
                        ];
                    }
                    break;
                }
            }
        }

        // Third: Fuzzy matches
        foreach ($this->locations as $location) {
            $score = $this->calculateSimilarity($query, strtolower($location['name']));
            if ($score > 0.70 && !$this->locationExists($suggestions, $location['name'])) {
                $suggestions[] = [
                    'location' => $location,
                    'score' => $score,
                    'type' => 'fuzzy_match'
                ];
            }
        }

        // Sort by score
        usort($suggestions, fn($a, $b) => $b['score'] <=> $a['score']);
        $suggestions = array_slice($suggestions, 0, $limit);

        return [
            'success' => true,
            'query' => $query,
            'suggestions' => array_map(function($s) {
                return array_merge($s['location'], [
                    'match_score' => round($s['score'], 2),
                    'match_type' => $s['type']
                ]);
            }, $suggestions),
            'count' => count($suggestions)
        ];
    }

    /**
     * Validate and correct a location
     */
    public function validateLocation(string $input): array
    {
        $input = trim($input);
        if (empty($input)) {
            return [
                'success' => false,
                'error' => 'EMPTY_INPUT',
                'message' => 'Please enter a location name'
            ];
        }

        $query = strtolower($input);

        // Exact match
        foreach ($this->locations as $location) {
            if (strtolower($location['name']) === $query) {
                return [
                    'success' => true,
                    'input' => $input,
                    'corrected' => $location['name'],
                    'confidence' => 1.0,
                    'data' => $location
                ];
            }
        }

        // Alternative match
        foreach ($this->locations as $location) {
            if (in_array($query, array_map('strtolower', $location['alternatives'] ?? []))) {
                return [
                    'success' => true,
                    'input' => $input,
                    'corrected' => $location['name'],
                    'confidence' => 0.98,
                    'data' => $location
                ];
            }
        }

        // Fuzzy match - find best match
        $bestMatch = null;
        $bestScore = 0;
        foreach ($this->locations as $location) {
            $score = $this->calculateSimilarity($query, strtolower($location['name']));
            if ($score > $bestScore) {
                $bestMatch = $location;
                $bestScore = $score;
            }
        }

        if ($bestScore > 0.85) {
            return [
                'success' => true,
                'input' => $input,
                'corrected' => $bestMatch['name'],
                'confidence' => round($bestScore, 2),
                'data' => $bestMatch
            ];
        }

        // Multiple close matches (ambiguous)
        $closeMatches = [];
        foreach ($this->locations as $location) {
            $score = $this->calculateSimilarity($query, strtolower($location['name']));
            if ($score > 0.70) {
                $closeMatches[] = [
                    'location' => $location,
                    'score' => $score
                ];
            }
        }

        if (count($closeMatches) > 1) {
            usort($closeMatches, fn($a, $b) => $b['score'] <=> $a['score']);
            return [
                'success' => false,
                'error' => 'AMBIGUOUS_LOCATION',
                'input' => $input,
                'confidence' => 0,
                'suggestions' => array_map(fn($m) => [
                    'name' => $m['location']['name'],
                    'district' => $m['location']['district'],
                    'isHillCountry' => $m['location']['isHillCountry'],
                    'score' => round($m['score'], 2)
                ], array_slice($closeMatches, 0, 3)),
                'message' => 'I found multiple matches. Did you mean: ' .
                    implode(', ', array_map(fn($m) => $m['location']['name'], array_slice($closeMatches, 0, 3))) . '?'
            ];
        }

        // No match found
        $suggestions = $this->autocomplete($input, 3)['suggestions'] ?? [];
        return [
            'success' => false,
            'error' => 'LOCATION_NOT_FOUND',
            'input' => $input,
            'confidence' => 0,
            'suggestions' => $suggestions,
            'message' => 'I couldn\'t find "' . htmlspecialchars($input) . '". Did you mean one of these?'
        ];
    }

    /**
     * Calculate distance between two locations
     */
    public function calculateDistance(string $from, string $to): array
    {
        $fromLocation = $this->findLocation($from);
        $toLocation = $this->findLocation($to);

        if (!$fromLocation) {
            return ['success' => false, 'error' => 'FROM_LOCATION_NOT_FOUND', 'location' => $from];
        }
        if (!$toLocation) {
            return ['success' => false, 'error' => 'TO_LOCATION_NOT_FOUND', 'location' => $to];
        }

        $distance = $this->haversineDistance(
            $fromLocation['coordinates']['lat'],
            $fromLocation['coordinates']['lng'],
            $toLocation['coordinates']['lat'],
            $toLocation['coordinates']['lng']
        );

        return [
            'success' => true,
            'from' => $fromLocation['name'],
            'to' => $toLocation['name'],
            'distance_km' => round($distance, 1),
            'route_type' => 'highway',
            'estimated_travel_time_hours' => round($distance / 60, 1),
            'pickup_hill_country' => $fromLocation['isHillCountry'],
            'destination_hill_country' => $toLocation['isHillCountry'],
            'is_hill_country_route' => $fromLocation['isHillCountry'] || $toLocation['isHillCountry'],
            'hill_country_surcharge' => ($fromLocation['isHillCountry'] || $toLocation['isHillCountry'])
        ];
    }

    /**
     * Check if location is in hill country
     */
    public function isHillCountry(string $location): array
    {
        $loc = $this->findLocation($location);
        if (!$loc) {
            return ['success' => false, 'error' => 'LOCATION_NOT_FOUND', 'location' => $location];
        }

        return [
            'success' => true,
            'location' => $loc['name'],
            'isHillCountry' => $loc['isHillCountry'],
            'description' => $loc['isHillCountry']
                ? 'Located in the central highlands. Hill surcharge applies.'
                : 'Lowland area. No additional hill surcharge.'
        ];
    }

    /**
     * Get all locations
     */
    public function getAllLocations(): array
    {
        return $this->locations;
    }

    // ====== HELPER METHODS ======

    private function findLocation(string $name): ?array
    {
        if (empty($name)) {
            return null;
        }

        $name = strtolower(trim($name));
        foreach ($this->locations as $location) {
            if (strtolower($location['name']) === $name) {
                return $location;
            }
        }
        return null;
    }

    private function locationExists(array $suggestions, string $name): bool
    {
        foreach ($suggestions as $s) {
            if ($s['location']['name'] === $name) {
                return true;
            }
        }
        return false;
    }

    private function calculateSimilarity(string $s1, string $s2): float
    {
        $distance = levenshtein($s1, $s2);
        $maxLength = max(strlen($s1), strlen($s2));
        return 1 - ($distance / ($maxLength ?: 1));
    }

    private function haversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $R = 6371; // Earth's radius in kilometers
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $R * $c;
    }

    private function getLocations(): array
    {
        return [
            // Western Province
            [
                'id' => 1,
                'name' => 'Colombo',
                'district' => 'Colombo',
                'province' => 'Western',
                'coordinates' => ['lat' => 6.9271, 'lng' => 80.7789],
                'alternatives' => ['CMB', 'colombo city', 'col', 'colombo'],
                'isHillCountry' => false,
                'distance_from_colombo' => 0
            ],
            [
                'id' => 2,
                'name' => 'Negombo',
                'district' => 'Negombo',
                'province' => 'Western',
                'coordinates' => ['lat' => 7.2081, 'lng' => 79.8393],
                'alternatives' => ['negambo', 'negombo beach'],
                'isHillCountry' => false,
                'distance_from_colombo' => 42
            ],

            // Central Province
            [
                'id' => 3,
                'name' => 'Kandy',
                'district' => 'Kandy',
                'province' => 'Central',
                'coordinates' => ['lat' => 6.9271, 'lng' => 80.6306],
                'alternatives' => ['kandie', 'candy', 'kandy city'],
                'isHillCountry' => true,
                'distance_from_colombo' => 115
            ],
            [
                'id' => 4,
                'name' => 'Nuwara Eliya',
                'district' => 'Nuwara Eliya',
                'province' => 'Central',
                'coordinates' => ['lat' => 6.9497, 'lng' => 80.7891],
                'alternatives' => ['nuwara', 'nuwaraeliya', 'nela', 'new ella'],
                'isHillCountry' => true,
                'distance_from_colombo' => 180
            ],
            [
                'id' => 5,
                'name' => 'Dambulla',
                'district' => 'Matale',
                'province' => 'Central',
                'coordinates' => ['lat' => 7.8673, 'lng' => 80.6517],
                'alternatives' => ['dambula', 'dambulla cave', 'dambulla temple'],
                'isHillCountry' => true,
                'distance_from_colombo' => 148
            ],
            [
                'id' => 6,
                'name' => 'Matale',
                'district' => 'Matale',
                'province' => 'Central',
                'coordinates' => ['lat' => 7.2773, 'lng' => 80.7236],
                'alternatives' => ['mata'],
                'isHillCountry' => true,
                'distance_from_colombo' => 128
            ],

            // Southern Province
            [
                'id' => 7,
                'name' => 'Galle',
                'district' => 'Galle',
                'province' => 'Southern',
                'coordinates' => ['lat' => 6.0535, 'lng' => 80.2170],
                'alternatives' => ['gale', 'gall', 'galle fort'],
                'isHillCountry' => false,
                'distance_from_colombo' => 119
            ],
            [
                'id' => 8,
                'name' => 'Matara',
                'district' => 'Matara',
                'province' => 'Southern',
                'coordinates' => ['lat' => 5.7764, 'lng' => 80.5406],
                'alternatives' => ['mata', 'matra'],
                'isHillCountry' => false,
                'distance_from_colombo' => 160
            ],

            // Eastern Province
            [
                'id' => 9,
                'name' => 'Trincomalee',
                'district' => 'Trincomalee',
                'province' => 'Eastern',
                'coordinates' => ['lat' => 8.5874, 'lng' => 81.2346],
                'alternatives' => ['trinco', 'trincomali'],
                'isHillCountry' => false,
                'distance_from_colombo' => 257
            ],
            [
                'id' => 10,
                'name' => 'Batticaloa',
                'district' => 'Batticaloa',
                'province' => 'Eastern',
                'coordinates' => ['lat' => 7.7131, 'lng' => 81.6924],
                'alternatives' => ['batticalao', 'batticaloa lagoon'],
                'isHillCountry' => false,
                'distance_from_colombo' => 355
            ],

            // Northern Province
            [
                'id' => 11,
                'name' => 'Jaffna',
                'district' => 'Jaffna',
                'province' => 'Northern',
                'coordinates' => ['lat' => 9.6615, 'lng' => 80.7740],
                'alternatives' => ['jaffna peninsula', 'jafna'],
                'isHillCountry' => false,
                'distance_from_colombo' => 401
            ],

            // North Western Province
            [
                'id' => 12,
                'name' => 'Kurunegala',
                'district' => 'Kurunegala',
                'province' => 'North Western',
                'coordinates' => ['lat' => 7.4865, 'lng' => 80.4384],
                'alternatives' => ['kurunegale', 'kurunegalla'],
                'isHillCountry' => false,
                'distance_from_colombo' => 92
            ],
            [
                'id' => 13,
                'name' => 'Chilaw',
                'district' => 'Puttalam',
                'province' => 'North Western',
                'coordinates' => ['lat' => 7.5704, 'lng' => 79.8036],
                'alternatives' => ['chielaw', 'chilaw beach'],
                'isHillCountry' => false,
                'distance_from_colombo' => 82
            ],

            // Uva Province
            [
                'id' => 14,
                'name' => 'Badulla',
                'district' => 'Badulla',
                'province' => 'Uva',
                'coordinates' => ['lat' => 6.9933, 'lng' => 81.0564],
                'alternatives' => ['badulla town'],
                'isHillCountry' => true,
                'distance_from_colombo' => 225
            ],

            // Sabaragamuwa Province
            [
                'id' => 15,
                'name' => 'Ratnapura',
                'district' => 'Ratnapura',
                'province' => 'Sabaragamuwa',
                'coordinates' => ['lat' => 6.7128, 'lng' => 80.4008],
                'alternatives' => ['ratnapura gem city', 'ratnapura'],
                'isHillCountry' => true,
                'distance_from_colombo' => 105
            ]
        ];
    }
}

/**
 * Example Laravel Controller Usage
 */

/*
namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    private $locationService;

    public function __construct()
    {
        $this->locationService = new LocationPredictorService();
    }

    // GET /api/locations/autocomplete?query=kan
    public function autocomplete(Request $request): JsonResponse
    {
        $query = $request->query('query', '');
        $limit = $request->query('limit', 5);
        $result = $this->locationService->autocomplete($query, $limit);
        return response()->json($result);
    }

    // POST /api/locations/validate
    public function validate(Request $request): JsonResponse
    {
        $location = $request->input('location', '');
        $result = $this->locationService->validateLocation($location);
        return response()->json($result);
    }

    // POST /api/locations/distance
    public function distance(Request $request): JsonResponse
    {
        $from = $request->input('from', '');
        $to = $request->input('to', '');
        $result = $this->locationService->calculateDistance($from, $to);
        return response()->json($result);
    }

    // POST /api/locations/is-hill-country
    public function isHillCountry(Request $request): JsonResponse
    {
        $location = $request->input('location', '');
        $result = $this->locationService->isHillCountry($location);
        return response()->json($result);
    }
}

// Add to routes/api.php:
// Route::get('/locations/autocomplete', [LocationController::class, 'autocomplete']);
// Route::post('/locations/validate', [LocationController::class, 'validate']);
// Route::post('/locations/distance', [LocationController::class, 'distance']);
// Route::post('/locations/is-hill-country', [LocationController::class, 'isHillCountry']);
*/

?>
