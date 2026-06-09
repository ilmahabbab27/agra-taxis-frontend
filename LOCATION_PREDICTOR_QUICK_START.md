# Location Predictor - Quick Start for Chatbot

How to integrate location autocomplete and validation into your chatbot.

---

## Installation (5 Minutes)

### Step 1: Copy PHP Service
```bash
cp LocationPredictorService.php app/Services/LocationPredictorService.php
```

### Step 2: Add Routes
```php
// routes/api.php
Route::get('/locations/autocomplete', [LocationController::class, 'autocomplete']);
Route::post('/locations/validate', [LocationController::class, 'validate']);
Route::post('/locations/distance', [LocationController::class, 'distance']);
Route::post('/locations/is-hill-country', [LocationController::class, 'isHillCountry']);
```

### Step 3: Create Controller
```php
namespace App\Http\Controllers\Api;

class LocationController extends Controller {
    public function autocomplete(Request $request) {
        $service = new LocationPredictorService();
        return response()->json($service->autocomplete($request->query('query'), 5));
    }

    public function validate(Request $request) {
        $service = new LocationPredictorService();
        return response()->json($service->validateLocation($request->input('location')));
    }

    public function distance(Request $request) {
        $service = new LocationPredictorService();
        return response()->json($service->calculateDistance(
            $request->input('from'),
            $request->input('to')
        ));
    }

    public function isHillCountry(Request $request) {
        $service = new LocationPredictorService();
        return response()->json($service->isHillCountry($request->input('location')));
    }
}
```

---

## API Reference

### Endpoint 1: Autocomplete
```
GET /api/locations/autocomplete?query=kan&limit=5

Response:
{
  "success": true,
  "suggestions": [
    {
      "name": "Kandy",
      "district": "Kandy",
      "isHillCountry": true,
      "match_score": 0.99
    }
  ],
  "count": 1
}
```

### Endpoint 2: Validate
```
POST /api/locations/validate
{"location": "colmbo"}

Response Success:
{
  "success": true,
  "corrected": "Colombo",
  "confidence": 0.95,
  "data": {
    "name": "Colombo",
    "isHillCountry": false
  }
}

Response Ambiguous:
{
  "success": false,
  "error": "AMBIGUOUS_LOCATION",
  "suggestions": [{"name": "Matara"}, {"name": "Matale"}],
  "message": "Did you mean Matara or Matale?"
}
```

### Endpoint 3: Distance
```
POST /api/locations/distance
{"from": "Colombo", "to": "Kandy"}

Response:
{
  "success": true,
  "distance_km": 115,
  "is_hill_country_route": true,
  "hill_country_surcharge": true
}
```

### Endpoint 4: Hill Country Check
```
POST /api/locations/is-hill-country
{"location": "Kandy"}

Response:
{
  "success": true,
  "isHillCountry": true,
  "description": "Located in the central highlands. Hill surcharge applies."
}
```

---

## Chatbot Implementation Examples

### Example 1: Real-time Autocomplete (JavaScript)

```javascript
async function getLocationSuggestions(userInput) {
  const response = await fetch(`/api/locations/autocomplete?query=${encodeURIComponent(userInput)}&limit=5`);
  const data = await response.json();
  
  if (!data.success) return [];
  
  return data.suggestions.map(s => ({
    text: s.name,
    value: s.name,
    subtitle: `${s.district} • ${s.isHillCountry ? '⛰️ Hill Country' : 'Lowland'}`
  }));
}

// Show suggestions as user types
inputElement.addEventListener('input', async (e) => {
  if (e.target.value.length >= 2) {
    const suggestions = await getLocationSuggestions(e.target.value);
    showDropdown(suggestions);
  }
});
```

### Example 2: Location Validation (JavaScript)

```javascript
async function validateLocation(location) {
  const response = await fetch('/api/locations/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location })
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log(`✓ Corrected: ${location} → ${result.corrected}`);
    return result.data;
  } else if (result.error === 'AMBIGUOUS_LOCATION') {
    console.log(`? Multiple matches found:`);
    result.suggestions.forEach(s => console.log(`  - ${s.name}`));
    return null;
  } else {
    console.log(`✗ Location not found: ${location}`);
    return null;
  }
}
```

### Example 3: Chatbot Conversation Flow

```javascript
async function handleLocationInput(userMessage) {
  const location = userMessage.trim();
  
  // Validate location
  const validated = await validateLocation(location);
  
  if (validated) {
    // Location is valid
    bot.send(`✓ Got it! You're traveling ${validated.isHillCountry ? 'to the hill country' : ''} (${validated.name})`);
    return validated;
  }
  
  // Try autocomplete
  const suggestions = await getLocationSuggestions(location);
  
  if (suggestions.length > 0) {
    bot.sendQuickReplies(
      `I didn't find "${location}". Did you mean:`,
      suggestions.map(s => ({
        text: s.text,
        callback: () => validateLocation(s.text)
      }))
    );
  } else {
    bot.send(`Sorry, I couldn't find "${location}". Try: Colombo, Kandy, Galle, Matara...`);
  }
  
  return null;
}
```

### Example 4: Full Booking Flow

```javascript
async function createBooking() {
  // Step 1: Get pickup location
  bot.send("Where are you traveling from?");
  const pickupInput = await bot.waitForInput();
  const pickupLocation = await validateLocation(pickupInput);
  if (!pickupLocation) return;
  
  // Step 2: Get destination
  bot.send("Where are you going?");
  const destinationInput = await bot.waitForInput();
  const destinationLocation = await validateLocation(destinationInput);
  if (!destinationLocation) return;
  
  // Step 3: Calculate distance
  const distanceResult = await fetch('/api/locations/distance', {
    method: 'POST',
    body: JSON.stringify({
      from: pickupLocation.name,
      to: destinationLocation.name
    })
  }).then(r => r.json());
  
  if (distanceResult.success) {
    bot.send(`📍 ${pickupLocation.name} → ${destinationLocation.name}`);
    bot.send(`📏 Distance: ${distanceResult.distance_km} km`);
    
    if (distanceResult.hill_country_surcharge) {
      bot.send(`⛰️ Hill country surcharge applies`);
    }
    
    // Step 4: Get vehicle type
    bot.send("Are you traveling with passengers or cargo?");
    const serviceType = await bot.waitForInput();
    
    // Step 5: Get fare estimate
    const fareEstimate = await estimateFare(
      pickupLocation,
      destinationLocation,
      serviceType,
      distanceResult.distance_km
    );
    
    bot.send(`💰 Estimated fare: Rs. ${fareEstimate}`);
  }
}
```

---

## Test Cases

### Test Location Autocomplete
```bash
curl "http://localhost:8000/api/locations/autocomplete?query=kan&limit=5"

# Expected: Kandy, Kurunegala suggestions
```

### Test Location Validation
```bash
curl -X POST http://localhost:8000/api/locations/validate \
  -H "Content-Type: application/json" \
  -d '{"location": "colmbo"}'

# Expected: Corrected to Colombo with confidence 0.95
```

### Test Typo Handling
```bash
curl -X POST http://localhost:8000/api/locations/validate \
  -H "Content-Type: application/json" \
  -d '{"location": "kandie"}'

# Expected: Corrected to Kandy
```

### Test Ambiguous Input
```bash
curl -X POST http://localhost:8000/api/locations/validate \
  -H "Content-Type: application/json" \
  -d '{"location": "mat"}'

# Expected: AMBIGUOUS_LOCATION error with suggestions
```

---

## Common Scenarios

### Scenario 1: User Types "col"
```
Bot: Showing suggestions...
✓ Colombo (Western, Lowland)

User clicks Colombo
Bot: ✓ Got it! You're traveling from Colombo
```

### Scenario 2: User Types "kandy"
```
User: "kandy"
Bot: ✓ Perfect! Kandy is confirmed (Hill Country)
```

### Scenario 3: User Types Misspelled "colmbo"
```
User: "colmbo"
Bot: ✓ I think you meant Colombo. Is that correct?
    [Yes] [No, let me choose]
```

### Scenario 4: User Types Ambiguous "mat"
```
User: "mat"
Bot: I found multiple locations:
    • Matara (Southern, Lowland)
    • Matale (Central, Hill Country)
    Which one?
```

---

## Features Included

✅ **Autocomplete:** Real-time suggestions as user types
✅ **Fuzzy Matching:** Handles typos and misspellings
✅ **Alternative Names:** Recognizes common variations
✅ **Hill Country Detection:** Auto-identifies surcharge areas
✅ **Distance Calculation:** Haversine formula for accuracy
✅ **Ambiguity Handling:** Shows multiple options when needed
✅ **Confidence Scoring:** Returns match quality scores

---

## Supported Locations

**15 Major Destinations:**
- Colombo, Negombo
- Kandy, Nuwara Eliya, Matale, Dambulla
- Galle, Matara
- Trincomalee, Batticaloa
- Jaffna
- Kurunegala, Chilaw
- Badulla
- Ratnapura

Easily extensible with more locations in `getLocations()` method.

---

## Performance Tips

1. **Cache results:** Store validated locations in session
2. **Debounce autocomplete:** Wait 300ms before calling API
3. **Limit suggestions:** Only show 5 best matches
4. **Preload on startup:** Load all locations into memory once

---

## Debugging

### No Suggestions Appearing?
```javascript
// Check if query is at least 2 characters
if (query.length < 2) return [];

// Check network tab - is API responding?
// Check if location name is in database
```

### Wrong Location Suggested?
```javascript
// Similarity threshold is 0.70
// Reduce to 0.65 for more lenient matching
// Or add more alternatives in getLocations()
```

### Hill Country Not Detected?
```javascript
// Check isHillCountry flag is set to true
// Verify location coordinates are correct
// Test with known hill locations: Kandy, Nuwara Eliya, Matale
```

---

## Integration Checklist

- [ ] Copy LocationPredictorService.php
- [ ] Create LocationController
- [ ] Add routes to api.php
- [ ] Test autocomplete endpoint
- [ ] Test validate endpoint
- [ ] Test distance endpoint
- [ ] Implement in chatbot frontend
- [ ] Handle edge cases (empty input, not found)
- [ ] Add error notifications to user
- [ ] Test on mobile UI
- [ ] Deploy to production

---

## Next Steps

1. **Integrate with Fare Estimation:** Use validated locations to call `/api/estimate-passenger-fare`
2. **Add More Locations:** Extend `getLocations()` with sub-towns
3. **Store User History:** Remember favorite locations for faster selection
4. **Add Google Maps:** Replace Haversine with Google Distance Matrix API for real driving distances
5. **Implement Caching:** Redis cache for frequent queries

