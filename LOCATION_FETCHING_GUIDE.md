# Customer Location Fetching - Complete Guide

Proper implementation for fetching and validating customer locations in your chatbot.

---

## Quick Setup

### Step 1: Copy Location Service
```bash
cp LocationPredictorService.php app/Services/LocationPredictorService.php
```

### Step 2: Add Routes
```php
// routes/api.php
Route::post('/locations/fetch', [LocationController::class, 'fetch']);
Route::post('/locations/suggest', [LocationController::class, 'suggest']);
Route::post('/locations/validate', [LocationController::class, 'validate']);
```

### Step 3: Create Controller
```php
namespace App\Http\Controllers\Api;

class LocationController extends Controller {
    public function fetch(Request $request) {
        $service = new LocationPredictorService();
        return response()->json($service->validateLocation($request->input('location')));
    }
    
    public function suggest(Request $request) {
        $service = new LocationPredictorService();
        return response()->json($service->autocomplete($request->input('query'), 5));
    }
    
    public function validate(Request $request) {
        $service = new LocationPredictorService();
        return response()->json($service->validateLocation($request->input('location')));
    }
}
```

---

## Endpoint 1: Fetch Location (Main)

**URL:** `POST /locations/fetch`

### Request
```json
{
  "location": "colombo"
}
```

### Success Response
```json
{
  "success": true,
  "input": "colombo",
  "corrected": "Colombo",
  "confidence": 1.0,
  "data": {
    "id": 1,
    "name": "Colombo",
    "district": "Colombo",
    "province": "Western",
    "coordinates": {
      "lat": 6.9271,
      "lng": 80.7789
    },
    "isHillCountry": false,
    "distance_from_colombo": 0
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "LOCATION_NOT_FOUND",
  "input": "colmbo",
  "confidence": 0,
  "suggestions": [
    {
      "name": "Colombo",
      "district": "Colombo",
      "isHillCountry": false,
      "score": 0.95
    }
  ],
  "message": "I couldn't find \"colmbo\". Did you mean Colombo?"
}
```

---

## Endpoint 2: Auto-Suggest (Real-time)

**URL:** `POST /locations/suggest`

### Request
```json
{
  "query": "kan",
  "limit": 5
}
```

### Response
```json
{
  "success": true,
  "query": "kan",
  "suggestions": [
    {
      "id": 3,
      "name": "Kandy",
      "district": "Kandy",
      "coordinates": { "lat": 6.9271, "lng": 80.6306 },
      "isHillCountry": true,
      "match_score": 0.99,
      "match_type": "prefix_match"
    },
    {
      "id": 12,
      "name": "Kurunegala",
      "coordinates": { "lat": 7.4865, "lng": 80.4384 },
      "isHillCountry": false,
      "match_score": 0.75,
      "match_type": "fuzzy_match"
    }
  ],
  "count": 2
}
```

---

## Endpoint 3: Validate Location

**URL:** `POST /locations/validate`

### Request
```json
{
  "location": "kandy"
}
```

### Response
```json
{
  "success": true,
  "input": "kandy",
  "corrected": "Kandy",
  "confidence": 1.0,
  "data": {
    "name": "Kandy",
    "district": "Kandy",
    "province": "Central",
    "coordinates": { "lat": 6.9271, "lng": 80.6306 },
    "isHillCountry": true,
    "distance_from_colombo": 115
  }
}
```

---

## Implementation Examples

### JavaScript: Fetch Location

```javascript
async function fetchLocation(customerInput) {
  try {
    const response = await fetch('/api/locations/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: customerInput.trim()
      })
    });

    const result = await response.json();

    if (result.success) {
      return {
        name: result.corrected,
        coordinates: result.data.coordinates,
        isHillCountry: result.data.isHillCountry,
        district: result.data.district
      };
    } else {
      // Show suggestions
      console.log('Suggestions:', result.suggestions);
      return null;
    }
  } catch (error) {
    console.error('Location fetch failed:', error);
    return null;
  }
}

// Usage
const location = await fetchLocation('colombo');
if (location) {
  console.log(`✓ ${location.name}`);
  console.log(`  Coordinates: ${location.coordinates.lat}, ${location.coordinates.lng}`);
  console.log(`  Hill Country: ${location.isHillCountry}`);
}
```

### JavaScript: Real-time Autocomplete

```javascript
let suggestionTimeout;

function setupLocationAutocomplete(inputElement, onSelect) {
  inputElement.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    // Clear previous timeout
    clearTimeout(suggestionTimeout);

    // Only search if at least 2 characters
    if (query.length < 2) {
      hideSuggestions();
      return;
    }

    // Debounce: wait 300ms before calling API
    suggestionTimeout = setTimeout(async () => {
      const suggestions = await getSuggestions(query);
      showSuggestions(inputElement, suggestions, onSelect);
    }, 300);
  });
}

async function getSuggestions(query) {
  try {
    const response = await fetch('/api/locations/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query,
        limit: 5
      })
    });

    const result = await response.json();
    return result.success ? result.suggestions : [];
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
}

function showSuggestions(element, suggestions, onSelect) {
  if (suggestions.length === 0) {
    hideSuggestions();
    return;
  }

  const dropdown = document.createElement('div');
  dropdown.className = 'suggestions-dropdown';

  suggestions.forEach(suggestion => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.textContent = `${suggestion.name}`;
    
    if (suggestion.isHillCountry) {
      item.textContent += ' ⛰️';
    }

    item.onclick = () => {
      onSelect(suggestion);
      hideSuggestions();
    };

    dropdown.appendChild(item);
  });

  document.body.appendChild(dropdown);
}

function hideSuggestions() {
  const dropdown = document.querySelector('.suggestions-dropdown');
  if (dropdown) dropdown.remove();
}

// Usage
setupLocationAutocomplete(
  document.getElementById('pickup-input'),
  (location) => {
    console.log('Selected:', location.name);
    document.getElementById('pickup-input').value = location.name;
  }
);
```

### PHP: Get Customer Location

```php
class LocationHelper {
    private $locationService;

    public function __construct() {
        $this->locationService = new LocationPredictorService();
    }

    /**
     * Get and validate customer location
     */
    public function getCustomerLocation($input) {
        // Validate
        $result = $this->locationService->validateLocation($input);

        if (!$result['success']) {
            return [
                'success' => false,
                'error' => $result['message'],
                'suggestions' => $result['suggestions'] ?? []
            ];
        }

        // Extract data
        $locationData = $result['data'];

        return [
            'success' => true,
            'name' => $locationData['name'],
            'lat' => $locationData['coordinates']['lat'],
            'lng' => $locationData['coordinates']['lng'],
            'isHillCountry' => $locationData['isHillCountry'],
            'district' => $locationData['district']
        ];
    }

    /**
     * Get autocomplete suggestions
     */
    public function getSuggestions($query, $limit = 5) {
        $result = $this->locationService->autocomplete($query, $limit);

        if (!$result['success']) {
            return [];
        }

        return array_map(function($suggestion) {
            return [
                'name' => $suggestion['name'],
                'district' => $suggestion['district'],
                'isHillCountry' => $suggestion['isHillCountry'],
                'matchScore' => $suggestion['match_score']
            ];
        }, $result['suggestions']);
    }
}

// Usage
$helper = new LocationHelper();

$pickup = $helper->getCustomerLocation('colombo');
if ($pickup['success']) {
    echo "Pickup: {$pickup['name']}";
    echo "Hill Country: " . ($pickup['isHillCountry'] ? 'Yes' : 'No');
}
```

---

## Chatbot Integration Flow

### Step 1: Get Pickup Location
```
Bot: "Where are you traveling from?"
Customer: "colombo"

API Call: POST /locations/fetch
Response: { success: true, corrected: "Colombo", isHillCountry: false }

Bot: "✓ Got it! You're traveling from Colombo"
```

### Step 2: Get Destination Location
```
Bot: "Where are you going?"
Customer: "kandy"

API Call: POST /locations/fetch
Response: { success: true, corrected: "Kandy", isHillCountry: true }

Bot: "✓ Kandy! (Hill country - surcharge applies)"
```

### Step 3: Calculate Distance
```
Distance: 115 km (from Colombo to Kandy)
Hill Country: Yes
Surcharge: +Rs. 10/km
```

---

## Error Handling

### Location Not Found
```javascript
if (!result.success) {
  // Show top 3 suggestions
  const suggestions = result.suggestions.slice(0, 3);
  const names = suggestions.map(s => s.name).join(', ');
  
  bot.send(`I couldn't find "${result.input}". Did you mean: ${names}?`);
  
  // Add quick reply buttons
  suggestions.forEach(s => {
    bot.addButton(s.name, () => selectLocation(s.name));
  });
}
```

### Ambiguous Input
```javascript
if (result.error === 'AMBIGUOUS_LOCATION') {
  // Multiple matches found
  result.suggestions.forEach(s => {
    bot.addButton(
      `${s.name} (${s.district})`,
      () => selectLocation(s.name)
    );
  });
}
```

### Network Error
```javascript
try {
  const location = await fetchLocation(input);
} catch (error) {
  bot.send("Sorry, I couldn't validate the location. Please try again.");
  console.error('Location fetch error:', error);
}
```

---

## Test Cases

### Test 1: Exact Match
```bash
curl -X POST http://localhost:8000/api/locations/fetch \
  -H "Content-Type: application/json" \
  -d '{"location": "Colombo"}'

Expected: success: true, confidence: 1.0
```

### Test 2: Typo Correction
```bash
curl -X POST http://localhost:8000/api/locations/fetch \
  -H "Content-Type: application/json" \
  -d '{"location": "colmbo"}'

Expected: success: true, corrected: "Colombo", confidence: 0.95+
```

### Test 3: Case Insensitive
```bash
curl -X POST http://localhost:8000/api/locations/fetch \
  -H "Content-Type: application/json" \
  -d '{"location": "KANDY"}'

Expected: success: true, corrected: "Kandy"
```

### Test 4: Alternative Name
```bash
curl -X POST http://localhost:8000/api/locations/fetch \
  -H "Content-Type: application/json" \
  -d '{"location": "nela"}'

Expected: success: true, corrected: "Nuwara Eliya"
```

### Test 5: Autocomplete
```bash
curl -X POST http://localhost:8000/api/locations/suggest \
  -H "Content-Type: application/json" \
  -d '{"query": "kan", "limit": 5}'

Expected: 
- Kandy (prefix match, score: 0.99)
- Kurunegala (fuzzy match, score: 0.75)
```

### Test 6: Hill Country Detection
```bash
curl -X POST http://localhost:8000/api/locations/fetch \
  -H "Content-Type: application/json" \
  -d '{"location": "Kandy"}'

Expected: isHillCountry: true
```

---

## Complete Customer Journey

```
Customer enters chatbot
  ↓
Bot: "Where are you traveling from?"
Customer: "colombo" → /locations/fetch
  ↓
Bot: "✓ Colombo (Western Province)"
  ↓
Bot: "Where are you going?"
Customer: "kan" → /locations/suggest (real-time autocomplete)
  Shows: Kandy, Kurunegala
  ↓
Customer selects: "Kandy"
Customer confirms: "Kandy" → /locations/fetch
  ↓
Bot: "✓ Kandy (Hill Country - extra charge applies)"
  ↓
Bot: Calculates fare using both locations
  Distance: 115 km
  Pickup: Colombo (not hill)
  Destination: Kandy (hill)
  Hill surcharge: Yes
  ↓
Bot: Shows fare estimate with breakdown
```

---

## Performance Tips

1. **Debounce autocomplete** - Wait 300ms before calling API
2. **Cache results** - Store validated locations in session
3. **Limit suggestions** - Show only top 5 matches
4. **Preload data** - Load all locations on startup
5. **Error handling** - Always have fallback suggestions

---

## Checklist

- ✅ Copy LocationPredictorService.php
- ✅ Create LocationController
- ✅ Add routes to api.php
- ✅ Test location fetch endpoint
- ✅ Test autocomplete endpoint
- ✅ Test typo correction
- ✅ Test hill country detection
- ✅ Integrate with chatbot UI
- ✅ Add error handling
- ✅ Handle slow network
- ✅ Show suggestions on error
- ✅ Cache validated locations

**Ready to fetch customer locations properly!** ✓

