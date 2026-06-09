# Agra Taxis API Documentation

Complete API documentation for agrataxis.com booking system.

**Base URL:** `https://agrataxis.com/backend/api`

---

## API Endpoints Summary

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| GET | `/api/vehicles` | Get all vehicles | Vehicle list |
| GET | `/api/vehicles?passengers=5` | Get vehicles by passenger count | Filtered vehicles |
| POST | `/api/locations/suggest` | Location autocomplete | Location suggestions |
| POST | `/api/bot/location` | Validate location | Validated location + coordinates |
| POST | `/api/locations/distance` | Calculate distance | Distance in km |
| POST | `/api/bot/calculate` | Calculate fare estimate | Fare breakdown |

---

## 1. GET Vehicles

**Endpoint:** `https://agrataxis.com/backend/api/vehicles`

**Method:** GET

**Query Parameters:**
```
?passengers=5    (optional - filter by minimum seats)
```

**Example Request:**
```bash
curl -X GET "https://agrataxis.com/backend/api/vehicles?passengers=5" \
  -H "Content-Type: application/json"
```

**Response (Success):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Toyota Hiace",
      "seats": 14,
      "category": "Minibus",
      "acPricePerKm": 180,
      "nonAcPricePerKm": 150,
      "acAvailable": true,
      "nonAcAvailable": true,
      "package1Prices": {
        "day1": {
          "acNormal": 15000,
          "acHill": 18000,
          "nonAcNormal": 12000,
          "nonAcHill": 14000
        }
      }
    },
    {
      "id": 2,
      "name": "Toyota Coaster",
      "seats": 32,
      "category": "Coach",
      "acPricePerKm": 200,
      "nonAcPricePerKm": 170,
      "acAvailable": true,
      "nonAcAvailable": false
    }
  ],
  "count": 2,
  "filtered": true
}
```

**Response (No vehicles match):**
```json
{
  "success": true,
  "data": [],
  "count": 0,
  "filtered": true,
  "message": "No vehicles available for 60 passengers"
}
```

---

## 2. POST Location Autocomplete

**Endpoint:** `https://agrataxis.com/backend/api/locations/suggest`

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "query": "kan",
  "limit": 5
}
```

**Example Request:**
```bash
curl -X POST "https://agrataxis.com/backend/api/locations/suggest" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "kan",
    "limit": 5
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "query": "kan",
  "suggestions": [
    {
      "location": "Kandy",
      "confidence": 0.95
    },
    {
      "location": "Kandapolit",
      "confidence": 0.85
    }
  ],
  "count": 2
}
```

**Response (No matches):**
```json
{
  "success": false,
  "suggestions": [],
  "message": "Enter at least 2 characters"
}
```

---

## 3. POST Validate Location

**Endpoint:** `https://agrataxis.com/backend/api/bot/location`

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "location": "colombo",
  "type": "pickup"
}
```

**Parameters:**
- `location` (string, required) - Location name (can include typos)
- `type` (string, optional) - "pickup", "destination", or "stop"

**Example Request:**
```bash
curl -X POST "https://agrataxis.com/backend/api/bot/location" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "colombo",
    "type": "pickup"
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "location": "Colombo",
  "coordinates": {
    "lat": 6.9271,
    "lng": 79.8612
  },
  "district": "Western",
  "isHillCountry": false,
  "confidence": 0.98
}
```

**Response (Not Found - with suggestions):**
```json
{
  "success": false,
  "error": "LOCATION_NOT_FOUND",
  "message": "Location not found",
  "suggestions": [
    {
      "location": "Colombo",
      "confidence": 0.90
    },
    {
      "location": "Colombo East",
      "confidence": 0.80
    }
  ]
}
```

**Response (Empty Input):**
```json
{
  "success": false,
  "error": "EMPTY_INPUT",
  "message": "Location cannot be empty"
}
```

---

## 4. POST Calculate Distance

**Endpoint:** `https://agrataxis.com/backend/api/locations/distance`

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "from": "Colombo",
  "to": "Kandy"
}
```

**Example Request:**
```bash
curl -X POST "https://agrataxis.com/backend/api/locations/distance" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Colombo",
    "to": "Kandy"
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "from": "Colombo",
  "to": "Kandy",
  "distance_km": 115,
  "is_hill_country_route": true,
  "estimated_travel_time_hours": 2.5,
  "pickup_hill_country": false,
  "destination_hill_country": true
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "MISSING_LOCATIONS",
  "message": "Both locations are required"
}
```

---

## 5. POST Calculate Fare Estimate

**Endpoint:** `https://agrataxis.com/backend/api/bot/calculate`

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Request Body (Passenger):**
```json
{
  "serviceType": "Passenger",
  "pickup": "Colombo",
  "destination": "Kandy",
  "vehicle": "Toyota Hiace",
  "passengers": 5,
  "acOption": "AC",
  "days": 1,
  "tripType": "One Way",
  "stops": ["Negombo"],
  "date": "2026-06-15",
  "time": "10:00"
}
```

**Example Request:**
```bash
curl -X POST "https://agrataxis.com/backend/api/bot/calculate" \
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
```

**Response (Success - Passenger):**
```json
{
  "success": true,
  "serviceType": "Passenger",
  "estimatedFare": 20700,
  "distance": 115,
  "isHillCountry": true,
  "breakdown": {
    "baseFare": 18000,
    "hillSurcharge": 2700,
    "total": 20700
  },
  "pricePerKm": 180,
  "vehicle": "Toyota Hiace",
  "passengers": 5,
  "acOption": "AC",
  "days": 1,
  "tripType": "One Way"
}
```

**Request Body (Lorry):**
```json
{
  "serviceType": "Lorry",
  "pickup": "Colombo",
  "destination": "Kandy",
  "lorryType": "7ft",
  "days": 1,
  "tripType": "One Way"
}
```

**Response (Success - Lorry):**
```json
{
  "success": true,
  "serviceType": "Lorry",
  "estimatedFare": 21400,
  "distance": 115,
  "isHillCountry": true,
  "breakdown": {
    "baseFare": 18500,
    "hillSurcharge": 2900,
    "total": 21400
  },
  "lorryType": "7 FT",
  "tripType": "One Way",
  "days": 1
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "INVALID_LOCATION",
  "message": "Invalid pickup or destination location"
}
```

---

## Complete Request Examples

### Example 1: Quick Quote (3 API calls)

```javascript
// Call 1: Validate pickup
const pickup = await fetch('https://agrataxis.com/backend/api/bot/location', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ location: 'Colombo' })
}).then(r => r.json());

// Call 2: Validate destination
const destination = await fetch('https://agrataxis.com/backend/api/bot/location', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ location: 'Kandy' })
}).then(r => r.json());

// Call 3: Get vehicles
const vehicles = await fetch('https://agrataxis.com/backend/api/vehicles?passengers=5')
  .then(r => r.json());

// Call 4: Calculate fare
const estimate = await fetch('https://agrataxis.com/backend/api/bot/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    serviceType: 'Passenger',
    pickup: 'Colombo',
    destination: 'Kandy',
    vehicle: 'Toyota Hiace',
    passengers: 5,
    acOption: 'AC',
    days: 1,
    tripType: 'One Way'
  })
}).then(r => r.json());

console.log('Estimated Fare: Rs. ' + estimate.estimatedFare);
```

### Example 2: With Stops (5 API calls)

```javascript
// Validate pickup
const pickup = await validateLocation('Colombo');

// Validate destination
const destination = await validateLocation('Kandy');

// Validate stops
const stop1 = await validateLocation('Negombo');
const stop2 = await validateLocation('Kurunegala');

// Get vehicles
const vehicles = await fetch('https://agrataxis.com/backend/api/vehicles?passengers=5')
  .then(r => r.json());

// Calculate with stops
const estimate = await fetch('https://agrataxis.com/backend/api/bot/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    serviceType: 'Passenger',
    pickup: 'Colombo',
    destination: 'Kandy',
    stops: ['Negombo', 'Kurunegala'],
    vehicle: 'Toyota Hiace',
    passengers: 5,
    acOption: 'AC',
    tripType: 'One Way'
  })
}).then(r => r.json());
```

---

## Error Codes

| Error Code | HTTP Status | Meaning | Solution |
|-----------|-------------|---------|----------|
| EMPTY_INPUT | 400 | Required field is empty | Provide location/data |
| LOCATION_NOT_FOUND | 404 | Location doesn't exist | Use suggestions |
| VALIDATION_ERROR | 400 | Input validation failed | Check format |
| VEHICLE_NOT_FOUND | 404 | Selected vehicle unavailable | Choose another |
| MISSING_LOCATIONS | 400 | Pickup or destination missing | Provide both |
| DISTANCE_CALCULATION_FAILED | 500 | Distance calc error | Retry or contact support |
| CALCULATION_ERROR | 500 | Fare calculation error | Retry or contact support |
| INVALID_LOCATION | 400 | Invalid pickup/destination | Validate again |

---

## Rate Limiting

- **Limit:** 100 requests per minute per IP
- **Header:** `X-RateLimit-Remaining: 95`
- **Response:** 429 Too Many Requests

---

## Authentication (Future)

Currently: **No authentication required**

Future updates may require:
```
Authorization: Bearer {token}
```

---

## Supported Locations

Major cities supported:
- Colombo, Colombo East, Colombo Fort
- Kandy
- Galle
- Negombo
- Chilaw
- Kurunegala
- Matara
- Kalutara
- Anuradhapura
- Jaffna
- Batticaloa
- Trincomalee
- Nuwara Eliya
- Ratnapura
- Badulla

(15+ major locations with coordinates)

---

## Vehicle Types

### Passenger Vehicles
- Toyota Hiace (14 seats)
- Toyota Coaster (32 seats)
- Nissan Caravan (11 seats)
- Rosa Bus (20 seats)
- More...

### Lorries
- 7 FT Lorry
- 10.5 FT Lorry
- More...

---

## Pricing Rules

### Passenger Vehicles
```
Base Fare = Distance (km) × Price Per Km

AC Vehicles:
- Normal: Rs. 180/km
- Hill Country: Rs. 220/km

Non-AC Vehicles:
- Normal: Rs. 150/km
- Hill Country: Rs. 180/km

Hill Country Surcharge: +10% or specific amount
```

### Lorries
```
Calculation based on:
- Base start fee
- Per km extra charge
- Up/Down fees
- Hill country surcharge
- Distance brackets (100-130 km range)
```

---

## Integration Examples

### JavaScript (Frontend)

```javascript
class AgraTaxisClient {
  constructor(baseUrl = 'https://agrataxis.com/backend/api') {
    this.baseUrl = baseUrl;
  }

  async validateLocation(location) {
    const response = await fetch(`${this.baseUrl}/bot/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location })
    });
    return await response.json();
  }

  async getVehicles(passengers) {
    const response = await fetch(
      `${this.baseUrl}/vehicles?passengers=${passengers}`
    );
    return await response.json();
  }

  async calculateFare(bookingData) {
    const response = await fetch(`${this.baseUrl}/bot/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    return await response.json();
  }
}

// Usage
const client = new AgraTaxisClient();
const estimate = await client.calculateFare({
  serviceType: 'Passenger',
  pickup: 'Colombo',
  destination: 'Kandy',
  vehicle: 'Toyota Hiace',
  passengers: 5,
  acOption: 'AC',
  tripType: 'One Way'
});
```

### Python (Backend)

```python
import requests

class AgraTaxisAPI:
    def __init__(self, base_url='https://agrataxis.com/backend/api'):
        self.base_url = base_url

    def validate_location(self, location):
        response = requests.post(
            f'{self.base_url}/bot/location',
            json={'location': location}
        )
        return response.json()

    def get_vehicles(self, passengers):
        response = requests.get(
            f'{self.base_url}/vehicles',
            params={'passengers': passengers}
        )
        return response.json()

    def calculate_fare(self, booking_data):
        response = requests.post(
            f'{self.base_url}/bot/calculate',
            json=booking_data
        )
        return response.json()

# Usage
api = AgraTaxisAPI()
estimate = api.calculate_fare({
    'serviceType': 'Passenger',
    'pickup': 'Colombo',
    'destination': 'Kandy',
    'vehicle': 'Toyota Hiace',
    'passengers': 5,
    'acOption': 'AC',
    'tripType': 'One Way'
})
print(f"Fare: Rs. {estimate['estimatedFare']}")
```

---

## Contact

**Company:** Agra Taxis
- **Website:** https://agrataxis.com
- **API Base:** https://agrataxis.com/backend/api
- **Phone:** +94 72 3003 000
- **WhatsApp:** https://wa.me/94723003000
- **Email:** info@agrataxis.com

---

## Support

For API issues:
- Email: api@agrataxis.com
- Phone: +94 72 3003 000
- Status Page: https://status.agrataxis.com

---

**API Version:** 1.0
**Last Updated:** 2026-06-09
