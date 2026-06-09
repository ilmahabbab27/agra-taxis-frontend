# Location Predictor Service for Chatbot

Intelligent location matching and autocomplete to handle misspellings and ambiguous user input.

---

## Overview

When users enter locations in the chatbot:
- "colmbo" → Suggests "Colombo"
- "kandie" → Suggests "Kandy"
- "nela" → Suggests "Nuwara Eliya"
- "mat" → Suggests multiple options (Matara, Matale)

---

## Feature 1: Autocomplete Suggestions

### Endpoint
```
GET /api/locations/autocomplete?query=kan
```

### Response
```json
{
  "success": true,
  "suggestions": [
    {
      "name": "Kandy",
      "district": "Central",
      "coordinates": { "lat": 6.9271, "lng": 80.7789 },
      "isHillCountry": true,
      "alternatives": ["Kandie", "Kandy City"]
    },
    {
      "name": "Kandyan",
      "district": "Central",
      "coordinates": { "lat": 6.9300, "lng": 80.7800 },
      "isHillCountry": true,
      "alternatives": []
    }
  ],
  "count": 2
}
```

---

## Feature 2: Fuzzy Matching

### Handles These Cases
```
User Input          → Corrected To
"colmbo"           → Colombo
"kandy"            → Kandy  
"nuwaraeliya"      → Nuwara Eliya
"negombo"          → Negombo
"galle"            → Galle
"matara"           → Matara
"jaffna"           → Jaffna
"trinco"           → Trincomalee
"batticalao"       → Batticaloa
"kurunegala"       → Kurunegala
```

### Levenshtein Distance Algorithm
```
Similarity = 1 - (editDistance / maxLength)

Threshold:
- Score > 0.85 → Direct match
- Score 0.7-0.85 → Suggest with "Did you mean?"
- Score < 0.7 → Show multiple options
```

---

## Feature 3: Location Database

### Comprehensive Sri Lankan Locations

```javascript
const LOCATIONS = [
  // Western Province
  {
    name: "Colombo",
    district: "Colombo",
    province: "Western",
    coordinates: { lat: 6.9271, lng: 80.7789 },
    alternatives: ["CMB", "colombo city", "col"],
    isHillCountry: false,
    distance_from_colombo: 0
  },
  {
    name: "Negombo",
    district: "Negombo",
    province: "Western",
    coordinates: { lat: 7.2081, lng: 79.8393 },
    alternatives: ["negambo", "negombo beach"],
    isHillCountry: false,
    distance_from_colombo: 42
  },
  
  // Central Province (Hill Country)
  {
    name: "Kandy",
    district: "Kandy",
    province: "Central",
    coordinates: { lat: 6.9271, lng: 80.6306 },
    alternatives: ["kandie", "candy", "kandy city"],
    isHillCountry: true,
    distance_from_colombo: 115
  },
  {
    name: "Nuwara Eliya",
    district: "Nuwara Eliya",
    province: "Central",
    coordinates: { lat: 6.9497, lng: 80.7891 },
    alternatives: ["nuwara", "nuwaraeliya", "nela", "new ella"],
    isHillCountry: true,
    distance_from_colombo: 180
  },
  
  // Southern Province
  {
    name: "Galle",
    district: "Galle",
    province: "Southern",
    coordinates: { lat: 6.0535, lng: 80.2170 },
    alternatives: ["gale", "gall"],
    isHillCountry: false,
    distance_from_colombo: 119
  },
  {
    name: "Matara",
    district: "Matara",
    province: "Southern",
    coordinates: { lat: 5.7764, lng: 80.5406 },
    alternatives: ["mata", "matra"],
    isHillCountry: false,
    distance_from_colombo: 160
  },
  
  // North Central Province
  {
    name: "Dambulla",
    district: "Matale",
    province: "Central",
    coordinates: { lat: 7.8673, lng: 80.6517 },
    alternatives: ["dambula", "dambulla cave"],
    isHillCountry: true,
    distance_from_colombo: 148
  },
  {
    name: "Matale",
    district: "Matale",
    province: "Central",
    coordinates: { lat: 7.2773, lng: 80.7236 },
    alternatives: ["mata"],
    isHillCountry: true,
    distance_from_colombo: 128
  },
  
  // Eastern Province
  {
    name: "Trincomalee",
    district: "Trincomalee",
    province: "Eastern",
    coordinates: { lat: 8.5874, lng: 81.2346 },
    alternatives: ["trinco", "trincomalee", "trincomali"],
    isHillCountry: false,
    distance_from_colombo: 257
  },
  {
    name: "Batticaloa",
    district: "Batticaloa",
    province: "Eastern",
    coordinates: { lat: 7.7131, lng: 81.6924 },
    alternatives: ["batticalao", "batticaloa lagoon"],
    isHillCountry: false,
    distance_from_colombo: 355
  },
  
  // Northern Province
  {
    name: "Jaffna",
    district: "Jaffna",
    province: "Northern",
    coordinates: { lat: 9.6615, lng: 80.7740 },
    alternatives: ["jaffna peninsula", "jafna"],
    isHillCountry: false,
    distance_from_colombo: 401
  },
  
  // North Western Province
  {
    name: "Kurunegala",
    district: "Kurunegala",
    province: "North Western",
    coordinates: { lat: 7.4865, lng: 80.4384 },
    alternatives: ["kurunegale", "kurunegalla"],
    isHillCountry: false,
    distance_from_colombo: 92
  },
  {
    name: "Chilaw",
    district: "Puttalam",
    province: "North Western",
    coordinates: { lat: 7.5704, lng: 79.8036 },
    alternatives: ["chielaw", "chilaw beach"],
    isHillCountry: false,
    distance_from_colombo: 82
  },
  
  // Uva Province
  {
    name: "Badulla",
    district: "Badulla",
    province: "Uva",
    coordinates: { lat: 6.9933, lng: 81.0564 },
    alternatives: ["badulla town"],
    isHillCountry: true,
    distance_from_colombo: 225
  },
  
  // Sabaragamuwa Province
  {
    name: "Ratnapura",
    district: "Ratnapura",
    province: "Sabaragamuwa",
    coordinates: { lat: 6.7128, lng: 80.4008 },
    alternatives: ["ratnapura gem city"],
    isHillCountry: true,
    distance_from_colombo: 105
  }
];
```

---

## Endpoint 1: Autocomplete

### Request
```
GET /api/locations/autocomplete?query=kan&limit=5
```

### Response
```json
{
  "success": true,
  "query": "kan",
  "suggestions": [
    {
      "id": 1,
      "name": "Kandy",
      "district": "Kandy",
      "province": "Central",
      "coordinates": {
        "lat": 6.9271,
        "lng": 80.6306
      },
      "isHillCountry": true,
      "distance_from_colombo": 115,
      "match_score": 0.99,
      "match_type": "exact_prefix"
    },
    {
      "id": 12,
      "name": "Kurunegala",
      "district": "Kurunegala",
      "province": "North Western",
      "coordinates": {
        "lat": 7.4865,
        "lng": 80.4384
      },
      "isHillCountry": false,
      "distance_from_colombo": 92,
      "match_score": 0.75,
      "match_type": "fuzzy_match"
    }
  ]
}
```

---

## Endpoint 2: Validate Location

### Request
```
POST /api/locations/validate
{
  "location": "colmbo"
}
```

### Response (Success)
```json
{
  "success": true,
  "input": "colmbo",
  "corrected": "Colombo",
  "confidence": 0.95,
  "data": {
    "name": "Colombo",
    "district": "Colombo",
    "coordinates": { "lat": 6.9271, "lng": 80.7789 },
    "isHillCountry": false,
    "distance_from_colombo": 0
  }
}
```

### Response (Ambiguous)
```json
{
  "success": false,
  "error": "AMBIGUOUS_LOCATION",
  "input": "mat",
  "suggestions": [
    {
      "name": "Matara",
      "district": "Matara",
      "isHillCountry": false
    },
    {
      "name": "Matale",
      "district": "Matale",
      "isHillCountry": true
    }
  ],
  "message": "Did you mean Matara or Matale?"
}
```

---

## Endpoint 3: Distance Calculation

### Request
```
POST /api/locations/distance
{
  "from": "Colombo",
  "to": "Kandy"
}
```

### Response
```json
{
  "success": true,
  "from": "Colombo",
  "to": "Kandy",
  "distance_km": 115,
  "route_type": "highway",
  "estimated_travel_time_hours": 2.5,
  "pickup_hill_country": false,
  "destination_hill_country": true,
  "is_hill_country_route": true,
  "route_coordinates": {
    "start": { "lat": 6.9271, "lng": 80.7789 },
    "end": { "lat": 6.9271, "lng": 80.6306 }
  }
}
```

---

## Endpoint 4: Hill Country Classification

### Request
```
POST /api/locations/is-hill-country
{
  "location": "Nuwara Eliya"
}
```

### Response
```json
{
  "success": true,
  "location": "Nuwara Eliya",
  "isHillCountry": true,
  "elevation_m": 1897,
  "description": "Located in the central highlands"
}
```

---

## PHP Implementation

```php
<?php

class LocationPredictorService
{
    private $locations = [];

    public function __construct()
    {
        $this->locations = $this->initializeLocations();
    }

    /**
     * Get autocomplete suggestions
     */
    public function autocomplete(string $query, int $limit = 5): array
    {
        $query = strtolower(trim($query));
        if (strlen($query) < 2) {
            return ['suggestions' => [], 'count' => 0];
        }

        $suggestions = [];

        // First: Exact prefix matches (highest priority)
        foreach ($this->locations as $location) {
            if (strpos(strtolower($location['name']), $query) === 0) {
                $suggestions[] = [
                    'location' => $location,
                    'score' => 0.99,
                    'type' => 'prefix_match'
                ];
            }
        }

        // Second: Alternative names
        foreach ($this->locations as $location) {
            foreach ($location['alternatives'] ?? [] as $alt) {
                if (strpos(strtolower($alt), $query) === 0) {
                    $suggestions[] = [
                        'location' => $location,
                        'score' => 0.95,
                        'type' => 'alternative_match'
                    ];
                    break;
                }
            }
        }

        // Third: Fuzzy matches (Levenshtein distance)
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

        // Sort by score and limit
        usort($suggestions, fn($a, $b) => $b['score'] <=> $a['score']);
        $suggestions = array_slice($suggestions, 0, $limit);

        return [
            'success' => true,
            'query' => $query,
            'suggestions' => array_map(function($s) {
                return array_merge($s['location'], ['match_score' => $s['score'], 'match_type' => $s['type']]);
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

        // Fuzzy match
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
                'confidence' => $bestScore,
                'data' => $bestMatch
            ];
        }

        // Ambiguous: multiple close matches
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
            return [
                'success' => false,
                'error' => 'AMBIGUOUS_LOCATION',
                'input' => $input,
                'suggestions' => array_map(fn($m) => [
                    'name' => $m['location']['name'],
                    'district' => $m['location']['district'],
                    'isHillCountry' => $m['location']['isHillCountry']
                ], $closeMatches),
                'message' => 'Did you mean ' . implode(' or ', array_map(fn($m) => $m['location']['name'], $closeMatches)) . '?'
            ];
        }

        // No match
        return [
            'success' => false,
            'error' => 'LOCATION_NOT_FOUND',
            'input' => $input,
            'suggestions' => $this->autocomplete($input, 3)['suggestions'],
            'message' => 'Location not recognized. Did you mean any of these?'
        ];
    }

    /**
     * Calculate distance between two locations
     */
    public function calculateDistance(string $from, string $to): array
    {
        $fromLocation = $this->findLocation($from);
        $toLocation = $this->findLocation($to);

        if (!$fromLocation || !$toLocation) {
            return ['success' => false, 'error' => 'Location not found'];
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
            'is_hill_country_route' => $fromLocation['isHillCountry'] || $toLocation['isHillCountry']
        ];
    }

    /**
     * Check if location is in hill country
     */
    public function isHillCountry(string $location): array
    {
        $loc = $this->findLocation($location);
        if (!$loc) {
            return ['success' => false, 'error' => 'Location not found'];
        }

        return [
            'success' => true,
            'location' => $loc['name'],
            'isHillCountry' => $loc['isHillCountry'],
            'elevation_m' => $loc['elevation_m'] ?? null,
            'description' => $loc['isHillCountry'] ? 'Located in the central highlands' : 'Lowland area'
        ];
    }

    // Helper Methods

    private function calculateSimilarity(string $s1, string $s2): float
    {
        $distance = levenshtein($s1, $s2);
        $maxLength = max(strlen($s1), strlen($s2));
        return 1 - ($distance / ($maxLength ?: 1));
    }

    private function haversineDistance($lat1, $lon1, $lat2, $lon2): float
    {
        $R = 6371; // Earth radius in km
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $R * $c;
    }

    private function findLocation(string $name): ?array
    {
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
        return collect($suggestions)->some(fn($s) => $s['location']['name'] === $name);
    }

    private function initializeLocations(): array
    {
        // Return all locations (see database above)
        // In production, load from database
        return [
            ['name' => 'Colombo', 'district' => 'Colombo', ...],
            // ... more locations
        ];
    }
}

// Usage in Controller
$locationService = new LocationPredictorService();

// Auto-suggest
$suggestions = $locationService->autocomplete('kan');

// Validate
$result = $locationService->validateLocation('colmbo');

// Distance
$distance = $locationService->calculateDistance('Colombo', 'Kandy');
```

---

## Chatbot Integration Example

```javascript
// User types location
async function handleLocationInput(userInput) {
  // Get suggestions in real-time
  const suggestions = await fetch(`/api/locations/autocomplete?query=${userInput}`)
    .then(r => r.json());
  
  // Show suggestions to user
  if (suggestions.count > 0) {
    bot.sendQuickReplies(
      `Did you mean?`,
      suggestions.suggestions.map(s => ({
        text: s.name,
        callback: () => selectLocation(s.name)
      }))
    );
  } else {
    bot.send(`Sorry, I couldn't find "${userInput}". Common locations: Colombo, Kandy, Galle, Matara...`);
  }
}

// User confirms location
async function selectLocation(locationName) {
  const validation = await fetch('/api/locations/validate', {
    method: 'POST',
    body: JSON.stringify({ location: locationName })
  }).then(r => r.json());
  
  if (validation.success) {
    // Use validated location for fare estimation
    return validation.data;
  }
}
```

---

## Benefits

✅ **Handles Typos:** "colmbo" → "Colombo"
✅ **Autocomplete:** Suggest as user types
✅ **Multiple Options:** Show choices for ambiguous input
✅ **Hill Country Detection:** Automatic surcharge application
✅ **Distance Calculation:** Route information
✅ **Better UX:** Faster, fewer back-and-forth messages

---

## Database Schema (Optional)

```sql
CREATE TABLE locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  district VARCHAR(100),
  province VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_hill_country BOOLEAN DEFAULT false,
  elevation_m INT,
  distance_from_colombo INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE location_alternatives (
  id INT PRIMARY KEY AUTO_INCREMENT,
  location_id INT,
  alternative_name VARCHAR(100),
  FOREIGN KEY (location_id) REFERENCES locations(id)
);
```

