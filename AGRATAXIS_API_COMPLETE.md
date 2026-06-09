# Agra Taxis API - Complete Documentation

**One comprehensive guide for all API endpoints, chatbot flow, and implementation.**

---

## 🚀 Quick Start

**Base URL:** `https://agrataxis.com/backend/api`

**Company Contact:**
- 📞 Phone: +94 72 3003 000
- 💬 WhatsApp: https://wa.me/94723003000
- 📧 Email: info@agrataxis.com

---

## 📋 All Endpoints

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| GET | `/vehicles` | Get all vehicles | Vehicle list |
| GET | `/vehicles?passengers=5` | Filter by passenger count | Filtered vehicles |
| POST | `/locations/suggest` | Location autocomplete | Suggestions |
| POST | `/bot/location` | Validate location | Location + coordinates |
| POST | `/locations/distance` | Calculate distance | Distance in km |
| POST | `/bot/calculate` | Calculate fare estimate | Fare breakdown |

---

# ENDPOINT 1: GET Vehicles

## Overview
Get list of all vehicles or filter by passenger count.

## Endpoint
```
GET https://agrataxis.com/backend/api/vehicles
GET https://agrataxis.com/backend/api/vehicles?passengers=5
```

## Query Parameters
- `passengers` (optional, integer) - Minimum seats required

## Request Example
```bash
curl -X GET "https://agrataxis.com/backend/api/vehicles?passengers=5" \
  -H "Content-Type: application/json"
```

## Response (Success)
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

## Response (No vehicles match)
```json
{
  "success": true,
  "data": [],
  "count": 0,
  "filtered": true
}
```

## When Used
- **Booking Form:** Step 4 - Vehicle Selection
- **Chatbot:** Q5 - Vehicle Selection
- Called after passenger count is selected

---

# ENDPOINT 2: POST Location Autocomplete

## Overview
Get location suggestions as user types. Real-time autocomplete.

## Endpoint
```
POST https://agrataxis.com/backend/api/locations/suggest
```

## Headers
```
Content-Type: application/json
```

## Request Body
```json
{
  "query": "kan",
  "limit": 5
}
```

## Parameters
- `query` (string, required) - Location search term (min 2 chars)
- `limit` (integer, optional) - Max suggestions (default: 5)

## Request Example
```bash
curl -X POST "https://agrataxis.com/backend/api/locations/suggest" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "kan",
    "limit": 5
  }'
```

## Response (Success)
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

## Response (Query too short)
```json
{
  "success": false,
  "suggestions": [],
  "message": "Enter at least 2 characters"
}
```

## When Used
- **Booking Form:** Steps 7-8 - Autocomplete as user types
- **Chatbot:** Q2-Q8 - Show suggestions as user types
- Called on every keystroke (should debounce 300ms)

## Example Locations
- Colombo, Kandy, Galle, Negombo, Chilaw
- Kurunegala, Matara, Kalutara, Anuradhapura, Jaffna
- Batticaloa, Trincomalee, Nuwara Eliya, Ratnapura, Badulla

---

# ENDPOINT 3: POST Validate Location

## Overview
Validate location and get coordinates, district, hill country info.

## Endpoint
```
POST https://agrataxis.com/backend/api/bot/location
```

## Headers
```
Content-Type: application/json
```

## Request Body
```json
{
  "location": "colombo",
  "type": "pickup"
}
```

## Parameters
- `location` (string, required) - Location name (can include typos)
- `type` (string, optional) - "pickup", "destination", or "stop"

## Request Examples
```bash
# Validate pickup
curl -X POST "https://agrataxis.com/backend/api/bot/location" \
  -H "Content-Type: application/json" \
  -d '{"location": "colombo", "type": "pickup"}'

# Validate with typo (should autocorrect)
curl -X POST "https://agrataxis.com/backend/api/bot/location" \
  -H "Content-Type: application/json" \
  -d '{"location": "colmbo", "type": "pickup"}'

# Validate stop
curl -X POST "https://agrataxis.com/backend/api/bot/location" \
  -H "Content-Type: application/json" \
  -d '{"location": "negombo", "type": "stop"}'
```

## Response (Success)
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

## Response (Not Found - with suggestions)
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

## Response (Empty Input)
```json
{
  "success": false,
  "error": "EMPTY_INPUT",
  "message": "Location cannot be empty"
}
```

## When Used
- **Booking Form:** Steps 7-8 - Validate pickup and destination
- **Chatbot:** Q2, Q3, Q8 - Validate locations and stops
- Called after user selects location from suggestions

## Features
- ✅ Typo correction (e.g., "colmbo" → "Colombo")
- ✅ GPS coordinates
- ✅ District information
- ✅ Hill country detection
- ✅ Confidence score

---

# ENDPOINT 4: POST Calculate Distance

## Overview
Calculate distance between two locations using Haversine formula.

## Endpoint
```
POST https://agrataxis.com/backend/api/locations/distance
```

## Headers
```
Content-Type: application/json
```

## Request Body
```json
{
  "from": "Colombo",
  "to": "Kandy"
}
```

## Parameters
- `from` (string, required) - Pickup location
- `to` (string, required) - Destination location

## Request Examples
```bash
# Colombo to Kandy
curl -X POST "https://agrataxis.com/backend/api/locations/distance" \
  -H "Content-Type: application/json" \
  -d '{"from": "Colombo", "to": "Kandy"}'

# Colombo to Galle
curl -X POST "https://agrataxis.com/backend/api/locations/distance" \
  -H "Content-Type: application/json" \
  -d '{"from": "Colombo", "to": "Galle"}'
```

## Response (Success)
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

## Response (Error)
```json
{
  "success": false,
  "error": "MISSING_LOCATIONS",
  "message": "Both locations are required"
}
```

## When Used
- **Booking Form:** Step 8 - Immediate after destination selected
- **Real-time display:** Show distance and calculated amount instantly
- NOT called in chatbot (distance calculated server-side during /bot/calculate)

## Common Distances
```
Colombo → Kandy:        115 km
Colombo → Galle:        118 km
Colombo → Negombo:       42 km
Colombo → Kurunegala:    92 km
Colombo → Jaffna:       389 km
```

---

# ENDPOINT 5: POST Calculate Fare Estimate

## Overview
Calculate complete fare estimate with all details. **Main endpoint.**

## Endpoint
```
POST https://agrataxis.com/backend/api/bot/calculate
```

## Headers
```
Content-Type: application/json
```

## Request Body (Passenger Service)
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

## Request Body (Lorry Service)
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

## Parameters
| Parameter | Type | Required | Values | Notes |
|-----------|------|----------|--------|-------|
| serviceType | string | Yes | "Passenger", "Lorry" | Service type |
| pickup | string | Yes | Any valid location | Pickup location |
| destination | string | Yes | Any valid location | Drop location |
| vehicle | string | Yes* | Vehicle name | *For Passenger only |
| lorryType | string | Yes* | "7ft", "10.5ft" | *For Lorry only |
| passengers | integer | Yes* | 1-60 | *For Passenger only |
| acOption | string | Yes* | "AC", "Non-AC" | *For Passenger only |
| days | integer | No | 1+ | Default: 1 |
| tripType | string | Yes | "One Way", "Round Trip" | Trip type |
| stops | array | No | ["Location1", "Location2"] | Optional stops |
| date | string | No | "YYYY-MM-DD" | Optional booking date |
| time | string | No | "HH:MM" | Optional booking time |

## Request Examples
```bash
# Passenger - One Way
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

# Passenger - Round Trip
curl -X POST "https://agrataxis.com/backend/api/bot/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Passenger",
    "pickup": "Colombo",
    "destination": "Kandy",
    "vehicle": "Toyota Hiace",
    "passengers": 5,
    "acOption": "AC",
    "tripType": "Round Trip"
  }'

# Passenger - With Stops
curl -X POST "https://agrataxis.com/backend/api/bot/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Passenger",
    "pickup": "Colombo",
    "destination": "Kandy",
    "vehicle": "Toyota Hiace",
    "passengers": 5,
    "acOption": "AC",
    "tripType": "One Way",
    "stops": ["Negombo", "Kurunegala"]
  }'

# Lorry
curl -X POST "https://agrataxis.com/backend/api/bot/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Lorry",
    "pickup": "Colombo",
    "destination": "Kandy",
    "lorryType": "7ft",
    "tripType": "One Way"
  }'
```

## Response (Success - Passenger with Package Pricing)
```json
{
  "success": true,
  "data": {
    "package1": {
      "type": "package1",
      "name": "Day Package",
      "baseCharge": 15000,
      "includedKm": 150,
      "additionalKm": 0,
      "additionalCharges": 0,
      "total": 15000,
      "breakdown": {
        "basePackageCharge": 15000,
        "includedKmPerDay": 150,
        "includedKmTotal": 150,
        "additionalKm": 0,
        "pricePerAdditionalKm": 180,
        "additionalCharges": 0,
        "total": 15000
      }
    },
    "package2": {
      "type": "package2",
      "name": "Per KM",
      "pricePerKm": 180,
      "totalKm": 115,
      "total": 20700,
      "breakdown": {
        "distance": 115,
        "pricePerKm": 180,
        "isHillCountry": true,
        "total": 20700
      }
    },
    "recommended": "package1",
    "selectedPackage": 15000,
    "pricePerKm": 180,
    "effectiveDistance": 115,
    "days": 1,
    "tripType": "One Way",
    "vehicle": "Toyota Hiace",
    "passengers": 5,
    "acOption": "AC",
    "isHillCountry": true
  }
}
```

**Two Pricing Options Explained:**

**Package 1: Day Package** (RECOMMENDED for short trips)
- Fixed charge per day: Rs. 15,000
- Includes 150 km per day
- Additional km charged at: Rs. 180/km
- Best for: Distance ≤ 150 km per day
- Save Rs. 5,700 vs Package 2 on this trip!

**Package 2: Per-KM Pricing**
- Simple distance-based pricing
- Cost = Distance × Price Per KM
- No included km, all charged
- Best for: Very short trips (< 83 km)

## Response (Success - Lorry)
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

## Response (Error)
```json
{
  "success": false,
  "error": "INVALID_LOCATION",
  "message": "Invalid pickup or destination location"
}
```

## When Used
- **Booking Form:** Step 11 - Final estimate
- **Chatbot:** After all details collected
- Called only once when all data is ready

## Pricing Calculation
```
For Passenger (AC):
Base Fare = Distance × Price Per Km
Base Fare = 115 km × Rs. 180/km = Rs. 20,700

With Hill Country Surcharge:
Hill Surcharge = Rs. 2,700 (10% or fixed)
Total = Rs. 20,700 + Rs. 0 = Rs. 20,700

For Round Trip:
Distance = 115 × 2 = 230 km
Fare = 230 × 180 = Rs. 41,400

With Stops:
Distance = Colombo→Negombo + Negombo→Kandy
Distance = 42 + 73 = 115 km
Fare = 115 × 180 = Rs. 20,700
```

---

# 🤖 Chatbot Conversation Flow

Complete chatbot interaction with API calls.

## Conversation Structure

```
START
  ↓
Q1: Service Type (Passenger/Lorry)
  ↓
Q2: Pickup Location
  ↓ API: /api/bot/location (validate)
  ↓
Q3: Destination Location
  ↓ API: /api/bot/location (validate)
  ↓
Q4: Passengers (1-60)
  ↓ API: /api/vehicles (get filtered list)
  ↓
Q5: Vehicle Selection
  ↓
Q6: AC/Non-AC
  ↓
Q7: Trip Type (One Way/Round Trip)
  ↓
Q8: Add Stops (Optional)
  ↓ API: /api/bot/location (validate each stop)
  ↓
CALCULATE FARE
  ↓ API: /api/bot/calculate
  ↓ DISPLAY ESTIMATE
  ↓
BOOK (WhatsApp/Phone/Email)
```

## Q1: Service Type

**Bot asks:**
```
👋 Welcome to Agra Taxis!

What service do you need?
1️⃣ Passenger (Cars, Minibus)
2️⃣ Lorry (Trucks, Transport)

Please reply: Passenger or Lorry
```

**User input:** `Passenger`

**Data stored:** `serviceType = "Passenger"`

**API calls:** None

**Bot response:**
```
✓ Great! Passenger service selected.

Now, where are you picking up from?
```

---

## Q2: Pickup Location

**Bot asks:**
```
📍 Pickup Location

Where should we pick you up from?
(e.g., Colombo, Kandy, Galle, etc.)
```

**User input:** `colombo`

**API Call 1:**
```
POST /api/bot/location
{
  "location": "colombo",
  "type": "pickup"
}
```

**API Response:**
```json
{
  "success": true,
  "location": "Colombo",
  "coordinates": { "lat": 6.9271, "lng": 79.8612 },
  "district": "Western",
  "isHillCountry": false,
  "confidence": 0.98
}
```

**Data stored:**
```
pickup = "Colombo"
pickupCoordinates = { lat: 6.9271, lng: 79.8612 }
pickupIsHillCountry = false
```

**Bot response:**
```
✓ Pickup: Colombo

Now, where are you going?
```

---

## Q3: Destination Location

**Bot asks:**
```
🏁 Destination

Where are you going?
(e.g., Kandy, Galle, Negombo, etc.)
```

**User input:** `kandy`

**API Call 2:**
```
POST /api/bot/location
{
  "location": "kandy",
  "type": "destination"
}
```

**API Response:**
```json
{
  "success": true,
  "location": "Kandy",
  "coordinates": { "lat": 6.9271, "lng": 80.7789 },
  "district": "Central",
  "isHillCountry": true,
  "confidence": 0.95
}
```

**Data stored:**
```
destination = "Kandy"
destinationCoordinates = { lat: 6.9271, lng: 80.7789 }
destinationIsHillCountry = true
distance = 115
```

**Bot response:**
```
✓ Destination: Kandy
📏 Distance: 115 km
⏱️ Travel Time: ~2.5 hours

How many passengers?
```

---

## Q4: Passenger Count

**Bot asks:**
```
👥 How many passengers?

Enter number: 1-60
```

**User input:** `5`

**API Call 3:**
```
GET /api/vehicles?passengers=5
```

**API Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Toyota Hiace",
      "seats": 14,
      "acPricePerKm": 180,
      "nonAcPricePerKm": 150,
      "acAvailable": true,
      "nonAcAvailable": true
    },
    { ... more vehicles ... }
  ],
  "count": 5
}
```

**Data stored:**
```
passengers = 5
availableVehicles = [...]
```

**Bot response:**
```
✓ 5 passengers confirmed.

What vehicle would you like?

🚐 Toyota Hiace (14 seats) - AC/Non-AC available
🚗 Toyota Prius (5 seats) - AC only
[... more options ...]

Please choose vehicle name or number
```

---

## Q5: Vehicle Selection

**Bot asks:**
```
🚐 Select Vehicle

Choose from available vehicles:
1️⃣ Toyota Hiace (14 seats)
2️⃣ Toyota Coaster (32 seats)
3️⃣ Nissan Caravan (11 seats)

Please reply: Vehicle name or number
```

**User input:** `Toyota Hiace`

**Data stored:**
```
vehicle = "Toyota Hiace"
vehicleSeats = 14
```

**Bot response:**
```
✓ Vehicle: Toyota Hiace

This vehicle has AC and Non-AC options.
Which do you prefer?
```

---

## Q6: AC/Non-AC Option

**Bot asks:**
```
❄️ AC Option

Choose:
1️⃣ AC (Air Conditioned) - Rs. 180/km
2️⃣ Non-AC - Rs. 150/km

Please reply: AC or Non-AC
```

**User input:** `AC`

**Data stored:**
```
acOption = "AC"
pricePerKm = 180
```

**Bot response:**
```
✓ AC selected - Rs. 180/km

One Way or Round Trip?
```

---

## Q7: Trip Type

**Bot asks:**
```
🔄 Trip Type

Choose:
1️⃣ One Way - Go from Colombo to Kandy
   💰 Fare: 115 km × Rs. 180 = Rs. 20,700

2️⃣ Round Trip - Return to Colombo after Kandy
   💰 Fare: 230 km × Rs. 180 = Rs. 41,400

Please reply: One Way or Round Trip
```

**User input:** `One Way`

**Data stored:**
```
tripType = "One Way"
```

**Bot response:**
```
✓ One Way trip selected.

Do you want to add stops in between?
(Optional - e.g., stop at Negombo, Kurunegala)
```

---

## Q8: Add Stops (Optional)

**Bot asks:**
```
🛑 Intermediate Stops

Do you want to stop anywhere in between Colombo and Kandy?

Reply:
- "No" or skip to continue
- "Yes" to add stops
- Or list stops: "Negombo, Kurunegala"
```

**User input:** `Yes, Negombo`

**API Call 4:**
```
POST /api/bot/location
{
  "location": "Negombo",
  "type": "stop"
}
```

**API Response:**
```json
{
  "success": true,
  "location": "Negombo",
  "coordinates": { "lat": 7.2086, "lng": 79.8525 },
  "district": "Western",
  "isHillCountry": false
}
```

**Data stored:**
```
stops = ["Negombo"]
```

**Bot response:**
```
✓ Adding stop: Negombo

Any more stops? (max 5)
Reply: Stop name or "No" to continue
```

**User input:** `No`

**Bot displays:**
```
✓ Route confirmed:
📍 Colombo → 🛑 Negombo → 🏁 Kandy

Calculating your estimate...
```

---

## CALCULATE FARE

**API Call 5:**
```
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
  "tripType": "One Way"
}
```

**API Response:**
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
  "tripType": "One Way"
}
```

**Bot displays:**
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
─────────────────
TOTAL: Rs. 20,700

Ready to book?
```

---

## Q9: Confirm & Book

**Bot asks:**
```
📞 Book Your Ride

How would you like to proceed?

1️⃣ WhatsApp 
2️⃣ Call: +94 72 3003 000
3️⃣ Email: info@agrataxis.com

Reply: WhatsApp, Call, or Email
```

**User input:** `WhatsApp`

**Bot sends WhatsApp link:**
```
Great! Click here to complete your booking:

https://wa.me/94723003000?text=
I%20need%20a%20booking%3A%0A-%20Vehicle%3A%20Toyota%20Hiace%20(AC)%0A-%20Passengers%3A%205%0A-%20Pickup%3A%20Colombo%0A-%20Stops%3A%20Negombo%0A-%20Destination%3A%20Kandy%0A-%20Distance%3A%20115%20km%0A-%20Amount%3A%20Rs.%2020%2C700

Our team will confirm your booking shortly!
```

---

# 📱 Booking Form Integration

## 9-Step Progressive Flow

```
Step 0: Service Type (Passenger/Lorry)
Step 1: Trip Type (One Way/Round Trip)
Step 2: Passenger Count (1-60)
Step 3: Vehicle Selection
  ├─ GET /api/vehicles?passengers={count}
  └─ Show filtered vehicles
Step 4: AC/Non-AC (if available)
Step 5: Pickup Location
  ├─ POST /api/locations/suggest (autocomplete)
  ├─ POST /api/bot/location (validate)
  └─ Show suggestions and validate
Step 6: Destination Location
  ├─ POST /api/locations/suggest (autocomplete)
  ├─ POST /api/bot/location (validate)
  ├─ POST /api/locations/distance (real-time)
  └─ Show real-time distance & amount
Step 7: Add Stops (Optional)
  ├─ POST /api/bot/location (validate each)
  └─ Show route visualization
Step 8: Review & Confirm
  └─ Display all details
Step 9: Calculate & Get Estimate
  ├─ POST /api/bot/calculate
  └─ Display breakdown with WhatsApp booking
```

## Real-Time Amount Display

```
When user selects destination:
1. Validate location (/api/bot/location)
2. Calculate distance (/api/locations/distance)
3. Show real-time amount calculation:
   - Distance: 115 km
   - Price/km: Rs. 180
   - Estimated Amount: Rs. 20,700 (115 × 180)
4. Update immediately as user changes selections
```

---

# 🧪 Testing Guide

## Quick Curl Tests

### Test 1: Get Vehicles
```bash
curl -X GET "https://agrataxis.com/backend/api/vehicles?passengers=5"
```

### Test 2: Autocomplete Location
```bash
curl -X POST "https://agrataxis.com/backend/api/locations/suggest" \
  -H "Content-Type: application/json" \
  -d '{"query": "kan", "limit": 5}'
```

### Test 3: Validate Location
```bash
curl -X POST "https://agrataxis.com/backend/api/bot/location" \
  -H "Content-Type: application/json" \
  -d '{"location": "colombo"}'
```

### Test 4: Calculate Distance
```bash
curl -X POST "https://agrataxis.com/backend/api/locations/distance" \
  -H "Content-Type: application/json" \
  -d '{"from": "Colombo", "to": "Kandy"}'
```

### Test 5: Calculate Fare
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
    "tripType": "One Way"
  }'
```

## Common Test Cases

**Test Location Typo:**
```bash
curl -X POST "https://agrataxis.com/backend/api/bot/location" \
  -H "Content-Type: application/json" \
  -d '{"location": "colmbo"}'
# Should correct to "Colombo"
```

**Test Round Trip:**
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
    "tripType": "Round Trip"
  }'
# Should return: 230 km × 180 = Rs. 41,400
```

**Test with Stops:**
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
    "tripType": "One Way",
    "stops": ["Negombo", "Kurunegala"]
  }'
# Total distance = 42 + 92 + 92 = 226 km
```

---

# ❌ Error Handling

## Error Codes

| Code | HTTP | Meaning | Solution |
|------|------|---------|----------|
| EMPTY_INPUT | 400 | Required field empty | Provide location/data |
| LOCATION_NOT_FOUND | 404 | Location invalid | Use suggestions |
| VALIDATION_ERROR | 400 | Input format wrong | Check format |
| VEHICLE_NOT_FOUND | 404 | Vehicle unavailable | Choose another |
| MISSING_LOCATIONS | 400 | Pickup/dest missing | Provide both |
| DISTANCE_CALCULATION_FAILED | 500 | Distance calc error | Retry |
| CALCULATION_ERROR | 500 | Fare calc error | Retry |
| INVALID_LOCATION | 400 | Invalid location | Validate again |

## Error Examples

### Empty Location
```json
{
  "success": false,
  "error": "EMPTY_INPUT",
  "message": "Location cannot be empty"
}
```

### Location Not Found
```json
{
  "success": false,
  "error": "LOCATION_NOT_FOUND",
  "message": "Location not found",
  "suggestions": [
    { "location": "Colombo", "confidence": 0.90 }
  ]
}
```

### Vehicle Not Found
```json
{
  "success": false,
  "error": "VEHICLE_NOT_FOUND",
  "message": "Vehicle not found"
}
```

---

# 💻 Implementation Examples

## JavaScript (Frontend)

```javascript
class AgraTaxisAPI {
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

  async calculateDistance(from, to) {
    const response = await fetch(`${this.baseUrl}/locations/distance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to })
    });
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
const api = new AgraTaxisAPI();
const estimate = await api.calculateFare({
  serviceType: 'Passenger',
  pickup: 'Colombo',
  destination: 'Kandy',
  vehicle: 'Toyota Hiace',
  passengers: 5,
  acOption: 'AC',
  tripType: 'One Way'
});
console.log(`Fare: Rs. ${estimate.estimatedFare}`);
```

## Python (Backend)

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

# 📦 Package Pricing System

## Two Pricing Models

### Package 1: Day Package (Recommended)
- **Base Charge:** Per day (from vehicle.package1Prices)
- **Includes:** 150 km per day
- **Additional km:** Charged at Price Per KM rate
- **Best for:** 1-3 day trips, medium distances

**Calculation:**
```
Total = Base Charge + (Additional KM × Price Per KM)
Where Additional KM = max(0, Total Distance - 150 km per day)
```

### Package 2: Per-KM Pricing
- **Simple formula:** Distance × Price Per KM
- **No included km:** All distance charged
- **Best for:** Very short trips (< 83 km)

**Calculation:**
```
Total = Distance × Price Per KM
For Round Trip: Total = (Distance × 2) × Price Per KM
```

## Pricing Examples

### 1-Day Trip, 115 km, AC, Hill Country

**Package 1 (Day Package):**
```
Base Charge (day1, AC, Hill): Rs. 18,000
Included: 150 km
Your distance: 115 km
Additional km: 0
Additional charge: Rs. 0
━━━━━━━━━━━━━━━━━━━━
TOTAL: Rs. 18,000 ✅
```

**Package 2 (Per-KM):**
```
Distance: 115 km
Price/km (Hill): Rs. 220
━━━━━━━━━━━━━━━━━━━━
TOTAL: 115 × 220 = Rs. 25,300
```

**SAVE Rs. 7,300 with Package 1!**

---

### 2-Day Trip, 115 km, AC, Hill Country

**Package 1 (Day Package):**
```
Base Charge (day2, AC, Hill): Rs. 33,600
Includes: 300 km (150 × 2)
Your distance: 115 km
Additional km: 0
━━━━━━━━━━━━━━━━━━━━
TOTAL: Rs. 33,600 ✅
```

**Package 2 (Per-KM):**
```
Distance: 115 km × 2 days = 230 km
Price/km: Rs. 220
━━━━━━━━━━━━━━━━━━━━
TOTAL: 230 × 220 = Rs. 50,600
```

**SAVE Rs. 17,000 with Package 1!**

---

### Round Trip, 115 km, AC, Hill Country

**Package 1 (Day Package):**
```
Base Charge (day1, AC, Hill): Rs. 18,000
Includes: 150 km
Round trip distance: 230 km (115 × 2)
Additional km: 80 km
Additional charge: 80 × 220 = Rs. 17,600
━━━━━━━━━━━━━━━━━━━━
TOTAL: Rs. 35,600 ✅
```

**Package 2 (Per-KM):**
```
Distance: 230 km (115 × 2)
Price/km: Rs. 220
━━━━━━━━━━━━━━━━━━━━
TOTAL: 230 × 220 = Rs. 50,600
```

**SAVE Rs. 15,000 with Package 1!**

---

# 💰 Pricing Reference

## Passenger Vehicles

| Service | Normal | Hill Country |
|---------|--------|--------------|
| AC/km | Rs. 180 | Rs. 220 |
| Non-AC/km | Rs. 150 | Rs. 180 |

## Calculation Examples

### Example 1: One Way (AC)
```
Pickup: Colombo
Destination: Kandy
Distance: 115 km
Price/km: Rs. 180 (AC)

Fare = 115 × 180 = Rs. 20,700
```

### Example 2: Round Trip (AC)
```
Pickup: Colombo
Destination: Kandy
Distance: 115 km (one way)

Outbound: 115 km
Return: 115 km
Total: 230 km

Fare = 230 × 180 = Rs. 41,400
```

### Example 3: With Stops
```
Pickup: Colombo
Stop 1: Negombo (42 km)
Stop 2: Kurunegala (92 km)
Destination: Kandy (92 km)

Total: 42 + 92 + 92 = 226 km
Fare = 226 × 180 = Rs. 40,680
```

### Example 4: Hill Country
```
Pickup: Colombo (normal)
Destination: Kandy (hill country)
Distance: 115 km

Fare = 115 × 220 (hill rate) = Rs. 25,300
```

## Lorry Pricing

| Type | Start Fee | Per KM | Hill Extra |
|------|-----------|--------|------------|
| 7ft | Rs. 2,500 | Rs. 160 | +Rs. 10/km |
| 10.5ft | Rs. 6,000 | Rs. 230 | +Rs. 10/km |

---

# 📊 Supported Locations

15+ major locations with GPS coordinates:

| Location | District | Hill Country | Coordinates |
|----------|----------|--------------|-------------|
| Colombo | Western | No | 6.9271, 79.8612 |
| Kandy | Central | Yes | 6.9271, 80.7789 |
| Galle | Southern | No | 6.0535, 80.2166 |
| Negombo | Western | No | 7.2086, 79.8525 |
| Chilaw | Western | No | 7.1496, 79.8024 |
| Kurunegala | Central | No | 7.4864, 80.6350 |
| Matara | Southern | No | 5.7785, 80.5361 |
| Kalutara | Western | No | 6.5881, 80.0721 |
| Anuradhapura | North Central | No | 8.3114, 80.4167 |
| Jaffna | Northern | No | 9.6615, 80.7855 |
| Batticaloa | Eastern | No | 7.7102, 81.6924 |
| Trincomalee | Eastern | No | 8.5874, 81.2344 |
| Nuwara Eliya | Central | Yes | 6.9497, 80.7891 |
| Ratnapura | Central | No | 6.6829, 80.4003 |
| Badulla | Eastern | Yes | 6.9916, 81.0571 |

---

# ✅ Complete Checklist

## Implementation Checklist

- [ ] Copy Laravel controller code to `app/Http/Controllers/Api/BookingApiController.php`
- [ ] Copy routes to `routes/api.php`
- [ ] Ensure LocationPredictorService.php exists with all locations
- [ ] Ensure FareEstimationService.php exists with calculation logic
- [ ] Import vehicle data from JSON export to database
- [ ] Test all 5 endpoints with curl examples
- [ ] Test error scenarios
- [ ] Implement frontend booking form steps 0-11
- [ ] Implement chatbot conversation Q1-Q9
- [ ] Test real-time distance and amount display
- [ ] Test with different passengers, vehicles, trip types
- [ ] Test location typo correction
- [ ] Test hill country detection
- [ ] Deploy to production
- [ ] Enable CORS for frontend domain

---

# 📞 Support & Contact

**Agra Taxis**
- 🌐 Website: https://agrataxis.com
- 📞 Phone: +94 72 3003 000
- 💬 WhatsApp: https://wa.me/94723003000
- 📧 Email: info@agrataxis.com
- 🔧 API Support: api@agrataxis.com

---

**API Documentation Complete** ✅

**Base URL:** `https://agrataxis.com/backend/api`
**Version:** 1.0
**Last Updated:** 2026-06-09
**Status:** Ready for Production 🚀
