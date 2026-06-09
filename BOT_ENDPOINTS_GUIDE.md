# Bot Endpoints - Simple Integration Guide

Two endpoints to connect your existing chatbot to Agra Connect fare calculation.

---

## Setup (2 Minutes)

### Step 1: Copy File
```bash
cp BotEndpoints.php app/Http/Controllers/Api/BotController.php
```

### Step 2: Add Routes
```php
// routes/api.php
Route::post('/bot/location', [BotController::class, 'location']);
Route::post('/bot/calculate', [BotController::class, 'calculate']);
```

### That's it! Ready to use.

---

## Endpoint 1: Location Validation

**URL:** `POST /bot/location`

### Request
```json
{
  "location": "colmbo",
  "type": "pickup"
}
```

### Success Response
```json
{
  "success": true,
  "location": "Colombo",
  "coordinates": {
    "lat": 6.9271,
    "lng": 80.7789
  },
  "isHillCountry": false,
  "district": "Colombo",
  "confidence": 0.95
}
```

### Error Response (Not Found)
```json
{
  "success": false,
  "message": "I couldn't find ...",
  "suggestions": [
    {
      "name": "Colombo",
      "district": "Colombo"
    }
  ]
}
```

### Usage in Chatbot
```javascript
async function validateLocation(locationInput) {
  const response = await fetch('http://localhost:8000/api/bot/location', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: locationInput,
      type: 'pickup'
    })
  });

  const data = await response.json();

  if (data.success) {
    console.log(`✓ ${data.location} (Hill Country: ${data.isHillCountry})`);
    return data;
  } else {
    console.log(`✗ Not found. Try: ${data.suggestions.map(s => s.name).join(', ')}`);
    return null;
  }
}
```

---

## Endpoint 2: Fare Calculation

**URL:** `POST /bot/calculate`

### For Passenger Vehicles

**Request:**
```json
{
  "serviceType": "Passenger",
  "pickup": "Colombo",
  "destination": "Kandy",
  "vehicle": "Toyota Hiace",
  "passengers": 5,
  "acOption": "AC",
  "days": 1,
  "tripType": "One Way"
}
```

**Response:**
```json
{
  "success": true,
  "serviceType": "Passenger",
  "estimatedFare": 18000,
  "distance": 115.5,
  "isHillCountry": true,
  "breakdown": {
    "package1": 18000,
    "package2": 20799,
    "recommended": 18000
  },
  "pricePerKm": 180,
  "vehicle": "Toyota Hiace",
  "passengers": 5,
  "acOption": "AC",
  "days": 1
}
```

### For Lorry Services

**Request:**
```json
{
  "serviceType": "Lorry",
  "pickup": "Colombo",
  "destination": "Matara",
  "lorryType": "7ft",
  "tripType": "One Way",
  "days": 1
}
```

**Response:**
```json
{
  "success": true,
  "serviceType": "Lorry",
  "estimatedFare": 2500,
  "distance": 42,
  "isHillCountry": false,
  "breakdown": {
    "startCharge": 2500,
    "extraKmCharge": 0,
    "hillSurcharge": 0,
    "total": 2500
  },
  "lorryType": "7 FT",
  "tripType": "One Way",
  "days": 1
}
```

### Usage in Chatbot
```javascript
async function calculateFare(formData) {
  const response = await fetch('http://localhost:8000/api/bot/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceType: formData.serviceType,
      pickup: formData.pickup,
      destination: formData.destination,
      vehicle: formData.vehicle,
      passengers: formData.passengers,
      acOption: formData.acOption,
      days: formData.days,
      tripType: formData.tripType
    })
  });

  const data = await response.json();

  if (data.success) {
    return {
      fare: data.estimatedFare,
      distance: data.distance,
      breakdown: data.breakdown
    };
  } else {
    console.error('Calculation failed:', data.message);
    return null;
  }
}
```

---

## Complete Chat Flow Example

```javascript
// User enters pickup location
const pickup = "colombo";
const pickupData = await validateLocation(pickup);

if (!pickupData.success) {
  bot.send("Location not found. Try: Colombo, Kandy, Galle...");
  return;
}

// User enters destination
const destination = "kandy";
const destData = await validateLocation(destination);

if (!destData.success) {
  bot.send("Destination not found");
  return;
}

// Calculate fare
const fareData = await calculateFare({
  serviceType: 'Passenger',
  pickup: pickupData.location,
  destination: destData.location,
  vehicle: 'Toyota Hiace',
  passengers: 5,
  acOption: 'AC',
  days: 1,
  tripType: 'One Way'
});

bot.send(`
📍 ${pickupData.location} → ${destData.location}
💰 Rs. ${fareData.fare.toLocaleString()}
📏 Distance: ${fareData.distance} km
${destData.isHillCountry ? '⛰️ Hill Country: +Rs. 10/km' : ''}
`);
```

---

## Test with cURL

### Test Location Endpoint
```bash
curl -X POST http://localhost:8000/api/bot/location \
  -H "Content-Type: application/json" \
  -d '{"location": "colmbo", "type": "pickup"}'

# Response: Corrected to "Colombo"
```

### Test Fare Calculation
```bash
curl -X POST http://localhost:8000/api/bot/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Passenger",
    "pickup": "Colombo",
    "destination": "Kandy",
    "vehicle": "Toyota Hiace",
    "passengers": 5,
    "acOption": "AC",
    "days": 1,
    "tripType": "One Way"
  }'

# Response: Fare estimate with breakdown
```

---

## What Each Endpoint Does

### `/bot/location`
- ✓ Validates location input
- ✓ Corrects typos (colmbo → Colombo)
- ✓ Detects if location is in hill country
- ✓ Returns coordinates
- ✓ Suggests alternatives if not found

### `/bot/calculate`
- ✓ Calculates fare for passengers OR lorry
- ✓ Handles distance between locations
- ✓ Applies hill country surcharge
- ✓ Returns breakdown (package 1 & 2 for passengers)
- ✓ Recommends best option

---

## Parameters Reference

### Location Endpoint
| Parameter | Type | Required | Values |
|-----------|------|----------|--------|
| location | string | Yes | "Colombo", "Kandy", etc |
| type | string | No | "pickup", "destination" |

### Calculate Endpoint (Passenger)
| Parameter | Type | Required | Values |
|-----------|------|----------|--------|
| serviceType | string | Yes | "Passenger" |
| pickup | string | Yes | Location name |
| destination | string | Yes | Location name |
| vehicle | string | Yes | "Toyota Hiace", "Toyota Aqua" |
| passengers | number | Yes | 1-60 |
| acOption | string | Yes | "AC", "Non AC" |
| days | number | No | 1-30 (default: 1) |
| tripType | string | No | "One Way", "Round Trip" |

### Calculate Endpoint (Lorry)
| Parameter | Type | Required | Values |
|-----------|------|----------|--------|
| serviceType | string | Yes | "Lorry" |
| pickup | string | Yes | Location name |
| destination | string | Yes | Location name |
| lorryType | string | Yes | "7ft", "10.5ft" |
| tripType | string | No | "One Way", "Round Trip" |
| days | number | No | 1-30 (default: 1) |

---

## Error Handling

### Location Not Found
```javascript
if (!response.success) {
  // Show suggestions
  console.log(response.suggestions);
}
```

### Invalid Parameters
```javascript
if (!response.success && response.message) {
  // Show error message to user
  bot.send(response.message);
}
```

---

## Important Notes

1. **Location Validation:** Always call `/bot/location` first to validate and get coordinates
2. **Hill Country:** Automatically detected and applied to fare calculation
3. **Vehicle Data:** Update the `getVehicle()` method to fetch from your database
4. **Lorry Rates:** Update the `getLorryRates()` method to fetch from your database
5. **Typos:** Handles most common misspellings automatically

---

## Next Steps

1. ✓ Copy BotEndpoints.php
2. ✓ Add routes to api.php
3. ✓ Test with cURL
4. ✓ Update vehicle/lorry data to use database queries
5. ✓ Integrate into your chatbot
6. ✓ Monitor logs for errors

**That's all you need!** Two endpoints, complete integration. 🚀

