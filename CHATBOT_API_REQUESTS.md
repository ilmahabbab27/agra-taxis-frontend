# Chatbot API Requests - Implementation Guide

How the chatbot should structure and send API requests at each stage.

---

## Request 1: Validate Pickup Location

**When:** After user enters pickup location (Q2)

**Request:**
```json
POST /api/bot/location
{
  "location": "colombo",
  "type": "pickup"
}
```

**Response:**
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

**Chatbot Displays:**
```
✓ Pickup confirmed: Colombo
📍 District: Western
🏔️ Hill Country: No

Next: Where are you going?
```

**Store in Variable:**
```javascript
pickup = {
  location: "Colombo",
  coordinates: { lat: 6.9271, lng: 79.8612 },
  isHillCountry: false
}
```

**Error Handling:**
```json
{
  "success": false,
  "error": "LOCATION_NOT_FOUND",
  "message": "Location not found",
  "suggestions": [
    { "location": "Colombo", "confidence": 0.90 },
    { "location": "Colombo East", "confidence": 0.80 }
  ]
}
```

**Chatbot Displays:**
```
❌ "colombo" not recognized exactly.

Did you mean:
1️⃣ Colombo
2️⃣ Colombo East

Please choose or type full name:
```

---

## Request 2: Validate Destination Location

**When:** After user enters destination (Q3)

**Request:**
```json
POST /api/bot/location
{
  "location": "kandy",
  "type": "destination"
}
```

**Response:**
```json
{
  "success": true,
  "location": "Kandy",
  "coordinates": {
    "lat": 6.9271,
    "lng": 80.7789
  },
  "district": "Central",
  "isHillCountry": true,
  "confidence": 0.95
}
```

**Chatbot Displays:**
```
✓ Destination: Kandy
📍 District: Central
🏔️ Hill Country: Yes
```

**Store in Variable:**
```javascript
destination = {
  location: "Kandy",
  coordinates: { lat: 6.9271, lng: 80.7789 },
  isHillCountry: true
}
```

**Calculate Distance (Internal):**
```javascript
// Use Haversine formula or call distance endpoint
distance = calculateDistance(
  pickup.coordinates,
  destination.coordinates
);
// Distance: 115 km

chatbot.say("📏 Distance: 115 km");
chatbot.ask("How many passengers?");
```

---

## Request 3: Get Filtered Vehicle List

**When:** After user enters passenger count (Q4)

**Request:**
```json
GET /api/vehicles?passengers=5
```

**Response:**
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
      "nonAcAvailable": false,
      "package1Prices": { ... }
    }
  ],
  "count": 2,
  "filtered": true
}
```

**Chatbot Displays:**
```
✓ 5 passengers - Here are available vehicles:

1️⃣ Toyota Hiace (14 seats)
   💵 AC: Rs. 180/km | Non-AC: Rs. 150/km

2️⃣ Toyota Coaster (32 seats)
   💵 AC: Rs. 200/km (AC only)

Please choose vehicle:
```

**Store in Variable:**
```javascript
availableVehicles = data.data;
selectedVehicles = {
  "Toyota Hiace": { 
    acPrice: 180, 
    nonAcPrice: 150,
    hasAC: true,
    hasNonAC: true
  },
  "Toyota Coaster": { 
    acPrice: 200, 
    nonAcPrice: null,
    hasAC: true,
    hasNonAC: false
  }
}
```

---

## Request 4: Validate Stops (Optional)

**When:** User adds intermediate stops (Q8)

**Request (for each stop):**
```json
POST /api/bot/location
{
  "location": "negombo",
  "type": "stop"
}
```

**Response:**
```json
{
  "success": true,
  "location": "Negombo",
  "coordinates": {
    "lat": 7.2086,
    "lng": 79.8525
  },
  "district": "Western",
  "isHillCountry": false,
  "confidence": 0.98
}
```

**Chatbot Displays:**
```
✓ Stop 1: Negombo confirmed

Any more stops? (Max 5)
```

**Store in Variable:**
```javascript
stops = [
  {
    location: "Negombo",
    coordinates: { lat: 7.2086, lng: 79.8525 },
    isHillCountry: false
  }
];
```

**Multiple Stops:**
```javascript
// After user adds 2nd stop
stops = [
  { location: "Negombo", coordinates: {...} },
  { location: "Kurunegala", coordinates: {...} }
];

// Route visualization
chatbot.say("🛤️ Your route: Colombo → Negombo → Kurunegala → Kandy");
```

---

## Request 5: Calculate Final Fare Estimate

**When:** All details collected, user ready to calculate (Q8-9)

**Request:**
```json
POST /api/bot/calculate
{
  "serviceType": "Passenger",
  "pickup": "Colombo",
  "destination": "Kandy",
  "stops": ["Negombo"],
  "vehicle": "Toyota Hiace",
  "passengers": 5,
  "acOption": "AC",
  "days": 1,
  "tripType": "One Way",
  "date": "2026-06-15",
  "time": "10:00"
}
```

**Response:**
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

**Chatbot Displays:**
```
✅ YOUR ESTIMATE

🚐 Vehicle: Toyota Hiace (AC)
👥 Passengers: 5
📍 Pickup: Colombo
🛑 Stop: Negombo
🏁 Destination: Kandy
📏 Distance: 115 km
⏱️ Trip Type: One Way

💰 FARE BREAKDOWN
Base Fare: Rs. 18,000
Hill Country Surcharge: Rs. 2,700
───────────────────
TOTAL: Rs. 20,700

Ready to book? (WhatsApp/Call/Email)
```

**Store in Variable:**
```javascript
estimate = {
  fare: 20700,
  distance: 115,
  breakdown: {
    baseFare: 18000,
    hillSurcharge: 2700,
    total: 20700
  },
  details: {
    vehicle: "Toyota Hiace",
    passengers: 5,
    pickup: "Colombo",
    destination: "Kandy",
    stops: ["Negombo"],
    tripType: "One Way"
  }
}
```

---

## Error Responses & Handling

### Error 1: Location Not Found

**Request:**
```json
POST /api/bot/location
{
  "location": "xyz123"
}
```

**Response:**
```json
{
  "success": false,
  "error": "LOCATION_NOT_FOUND",
  "message": "Location not found",
  "suggestions": [
    { "location": "Colombo", "confidence": 0.85 },
    { "location": "Galle", "confidence": 0.75 }
  ]
}
```

**Chatbot Displays:**
```
❌ Location "xyz123" not found.

Did you mean:
1️⃣ Colombo
2️⃣ Galle

Please choose or type full location:
```

---

### Error 2: Vehicle Not Available for Passengers

**Request:**
```json
GET /api/vehicles?passengers=50
```

**Response:**
```json
{
  "success": true,
  "data": [],
  "count": 0,
  "filtered": true
}
```

**Chatbot Displays:**
```
❌ No vehicles available for 50 passengers.

Maximum passengers we can serve: 40
Please reduce passenger count:
```

---

### Error 3: Invalid Fare Calculation

**Request:**
```json
POST /api/bot/calculate
{
  "serviceType": "Passenger",
  "pickup": "Colombo",
  "destination": "unknown",
  ...
}
```

**Response:**
```json
{
  "success": false,
  "error": "INVALID_LOCATION",
  "message": "Invalid pickup or destination location"
}
```

**Chatbot Displays:**
```
❌ Could not calculate fare. 
Destination location not recognized.

Please provide valid locations:
- Pickup: Colombo ✓
- Destination: ?
```

---

## Request Building in Code

### JavaScript/Node.js

```javascript
async function makeAPIRequest(endpoint, data) {
  try {
    const response = await fetch(`http://localhost:8000${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      return { success: true, data: result };
    } else {
      return { success: false, error: result.error, message: result.message };
    }
  } catch (error) {
    return { success: false, error: 'API_ERROR', message: error.message };
  }
}

// Usage in chatbot
async function validateLocation(location) {
  const result = await makeAPIRequest('/api/bot/location', {
    location: location,
    type: 'pickup'
  });

  if (result.success) {
    chatbot.say(`✓ Confirmed: ${result.data.location}`);
  } else {
    chatbot.say(`❌ ${result.error}: ${result.message}`);
  }
}
```

### Python (for webhook/backend chatbot)

```python
import requests
import json

API_BASE = "http://localhost:8000"

def validate_location(location, location_type="pickup"):
    response = requests.post(
        f"{API_BASE}/api/bot/location",
        json={
            "location": location,
            "type": location_type
        }
    )
    return response.json()

def get_vehicles(passengers):
    response = requests.get(
        f"{API_BASE}/api/vehicles",
        params={"passengers": passengers}
    )
    return response.json()

def calculate_fare(booking_data):
    response = requests.post(
        f"{API_BASE}/api/bot/calculate",
        json=booking_data
    )
    return response.json()

# Usage
location_result = validate_location("colombo")
if location_result['success']:
    print(f"✓ {location_result['location']}")
else:
    print(f"❌ {location_result['error']}")
```

---

## Complete Chatbot Flow in Code

```javascript
class AgraTaxisChatbot {
  constructor() {
    this.bookingData = {
      serviceType: null,
      pickup: null,
      destination: null,
      passengers: null,
      vehicle: null,
      acOption: null,
      tripType: null,
      stops: [],
      distance: null,
      estimate: null
    };
  }

  async validatePickup(location) {
    const result = await this.apiCall('/api/bot/location', {
      location,
      type: 'pickup'
    });
    
    if (result.success) {
      this.bookingData.pickup = result.location;
      this.bookingData.pickupCoordinates = result.coordinates;
      return result;
    } else {
      throw new Error(result.message);
    }
  }

  async validateDestination(location) {
    const result = await this.apiCall('/api/bot/location', {
      location,
      type: 'destination'
    });
    
    if (result.success) {
      this.bookingData.destination = result.location;
      this.bookingData.destinationCoordinates = result.coordinates;
      return result;
    } else {
      throw new Error(result.message);
    }
  }

  async getVehicles(passengers) {
    const result = await this.apiCall(`/api/vehicles?passengers=${passengers}`, null, 'GET');
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error('No vehicles available');
    }
  }

  async calculateEstimate() {
    const result = await this.apiCall('/api/bot/calculate', this.bookingData);
    
    if (result.success) {
      this.bookingData.estimate = result;
      return result;
    } else {
      throw new Error(result.message);
    }
  }

  async apiCall(endpoint, data, method = 'POST') {
    const response = await fetch(`http://localhost:8000${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'POST' ? JSON.stringify(data) : null
    });

    return await response.json();
  }

  generateWhatsAppLink() {
    const { estimate, bookingData } = this;
    const message = `
I need a booking:
- Service: ${bookingData.serviceType}
- Vehicle: ${bookingData.vehicle}
- Passengers: ${bookingData.passengers}
- Pickup: ${bookingData.pickup}
${bookingData.stops.length ? `- Stops: ${bookingData.stops.join(', ')}` : ''}
- Destination: ${bookingData.destination}
- Trip Type: ${bookingData.tripType}
- Distance: ${bookingData.distance} km
- Estimated Fare: Rs. ${estimate.estimatedFare}
    `.trim();

    return `https://wa.me/94723003000?text=${encodeURIComponent(message)}`;
  }
}

// Usage
const chatbot = new AgraTaxisChatbot();

// Q1: Service Type
chatbot.bookingData.serviceType = "Passenger";

// Q2: Pickup
const pickup = await chatbot.validatePickup("colombo");

// Q3: Destination
const destination = await chatbot.validateDestination("kandy");

// Q4: Passengers
chatbot.bookingData.passengers = 5;

// Get vehicles
const vehicles = await chatbot.getVehicles(5);

// Q5: Vehicle
chatbot.bookingData.vehicle = "Toyota Hiace";

// Q6: AC/Non-AC
chatbot.bookingData.acOption = "AC";

// Q7: Trip Type
chatbot.bookingData.tripType = "One Way";

// Q9: Calculate
const estimate = await chatbot.calculateEstimate();

// Generate booking link
const whatsappLink = chatbot.generateWhatsAppLink();
chatbot.say(`Click here to book: ${whatsappLink}`);
```

---

**Chatbot API requests guide complete!** ✓
