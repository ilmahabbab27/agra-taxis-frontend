# Endpoints Implementation Checklist

Step-by-step checklist to implement all endpoints for the smart booking flow.

---

## Backend Setup

### 1. Database Models
- [ ] Vehicle model exists with columns:
  - [ ] id, name, seats, category
  - [ ] ac_price_per_km, non_ac_price_per_km
  - [ ] ac_hill_price_per_km, non_ac_hill_price_per_km
  - [ ] ac_available, non_ac_available
  - [ ] package1_prices (JSON)

- [ ] Lorry model exists with columns:
  - [ ] id, name, category
  - [ ] rate_table (JSON with 7ft, 10.5ft, etc.)

### 2. Service Classes

- [ ] `LocationPredictorService.php` created with:
  - [ ] `autocomplete($query, $limit)` method
  - [ ] `validateLocation($location)` method
  - [ ] `calculateDistance($from, $to)` method
  - [ ] `isHillCountry($location)` method
  - [ ] Location coordinates database (15+ major locations)

- [ ] `FareEstimationService.php` created with:
  - [ ] `estimatePassengerFare($vehicle, $options, $distance)` method
  - [ ] `estimateLorryFare($rates, $options, $distance)` method

### 3. Controller

- [ ] `BookingApiController.php` created in `App\Http\Controllers\Api` with:
  - [ ] `getVehicles(Request $request)` method
  - [ ] `suggestLocations(Request $request)` method
  - [ ] `validateLocation(Request $request)` method
  - [ ] `calculateDistance(Request $request)` method
  - [ ] `calculateFare(Request $request)` method
  - [ ] `calculatePassengerFare()` helper
  - [ ] `calculateLorryFare()` helper
  - [ ] `getLorryRates()` helper

### 4. Routes

- [ ] Routes file updated (`routes/api.php`) with:
  - [ ] `GET /api/vehicles` → getVehicles
  - [ ] `POST /api/locations/suggest` → suggestLocations
  - [ ] `POST /api/bot/location` → validateLocation
  - [ ] `POST /api/locations/distance` → calculateDistance
  - [ ] `POST /api/bot/calculate` → calculateFare

### 5. Data Import

- [ ] JSON export file available: `agra-taxis-export-2026-06-09.json`
- [ ] Data import command created or migration run
- [ ] Vehicles imported to database
- [ ] Lorries imported to database
- [ ] Company info updated

---

## Frontend Setup (Booking Form)

### Step-by-Step Integration

**Step 1: Service Type Selection**
- [ ] No API calls needed
- [ ] Store: `serviceType: "Passenger" | "Lorry"`

**Step 2: Trip Type Selection**
- [ ] No API calls needed
- [ ] Store: `tripType: "One Way" | "Round Trip"`

**Step 3: Passenger Count (1-60)**
- [ ] No API calls needed
- [ ] Store: `passengers: number`
- [ ] Trigger next step to load vehicles

**Step 4: Vehicle Selection**
- [ ] [ ] Call `GET /api/vehicles?passengers={count}`
- [ ] [ ] Parse response and display filtered vehicles
- [ ] [ ] Show vehicle details (name, seats, AC/Non-AC options)
- [ ] [ ] Store selected: `vehicle: string`

**Step 5: AC/Non-AC Option**
- [ ] [ ] Check if vehicle has both options
- [ ] [ ] Show option selector only if both available
- [ ] [ ] Store: `acOption: "AC" | "Non-AC"`

**Step 6: Date & Time (Optional)**
- [ ] [ ] Show optional date picker
- [ ] [ ] Show optional time picker
- [ ] [ ] Store: `date?: string, time?: string`

**Step 7: Pickup Location**
- [ ] [ ] Create input field with autocomplete
- [ ] [ ] On input change, call `POST /api/locations/suggest`
- [ ] [ ] Display suggestions dropdown
- [ ] [ ] On selection/blur, call `POST /api/bot/location`
- [ ] [ ] Show error if location not found
- [ ] [ ] Store: `pickup: string, pickupCoordinates: {lat, lng}`

**Step 8: Destination/Drop Location**
- [ ] [ ] Create input field with autocomplete
- [ ] [ ] On input change, call `POST /api/locations/suggest`
- [ ] [ ] Display suggestions dropdown
- [ ] [ ] On selection/blur, call `POST /api/bot/location`
- [ ] [ ] Immediately after validation, call `POST /api/locations/distance`
- [ ] [ ] Display real-time distance and calculated amount
- [ ] [ ] Store: `destination: string, distance: number, estimatedAmount: number`

**Step 9: Add Stops (Optional)**
- [ ] [ ] Show "Add Stop" button
- [ ] [ ] Allow user to add 1-5 stops
- [ ] [ ] For each stop, call `POST /api/bot/location` to validate
- [ ] [ ] Show route visualization (pickup → stops → destination)
- [ ] [ ] Store: `stops: string[]`

**Step 10: Review**
- [ ] [ ] Display all collected information
- [ ] [ ] Show summary with distance and estimated amount
- [ ] [ ] Allow user to edit any field

**Step 11: Final Estimate**
- [ ] [ ] Call `POST /api/bot/calculate` with all data
- [ ] [ ] Display final fare breakdown
- [ ] [ ] Show booking confirmation message
- [ ] [ ] Provide WhatsApp booking option

---

## API Testing

### Manual Testing (Using Curl)

```bash
# Test 1: Get Vehicles
curl -X GET "http://localhost:8000/api/vehicles?passengers=5"

# Expected Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Toyota Hiace",
      "seats": 14,
      "acPricePerKm": 180,
      ...
    }
  ],
  "count": 5
}
```

- [ ] Test with different passenger counts
- [ ] Test without passenger filter
- [ ] Verify vehicle data complete

```bash
# Test 2: Location Suggestions
curl -X POST "http://localhost:8000/api/locations/suggest" \
  -H "Content-Type: application/json" \
  -d '{"query": "kan", "limit": 5}'

# Expected Response:
{
  "success": true,
  "suggestions": [
    {"location": "Kandy", "confidence": 0.95}
  ],
  "count": 1
}
```

- [ ] Test with various location prefixes
- [ ] Test with misspellings
- [ ] Verify suggestion count

```bash
# Test 3: Validate Location
curl -X POST "http://localhost:8000/api/bot/location" \
  -H "Content-Type: application/json" \
  -d '{"location": "colombo"}'

# Expected Response:
{
  "success": true,
  "location": "Colombo",
  "coordinates": {"lat": 6.9271, "lng": 79.8612},
  "isHillCountry": false
}
```

- [ ] Test with various locations
- [ ] Test with typos (e.g., "colmbo")
- [ ] Test with invalid locations
- [ ] Verify coordinates are correct
- [ ] Verify hill country detection

```bash
# Test 4: Calculate Distance
curl -X POST "http://localhost:8000/api/locations/distance" \
  -H "Content-Type: application/json" \
  -d '{"from": "Colombo", "to": "Kandy"}'

# Expected Response:
{
  "success": true,
  "distance_km": 115,
  "is_hill_country_route": true
}
```

- [ ] Test various location pairs
- [ ] Verify distance calculations
- [ ] Test hill country detection
- [ ] Verify travel time estimate

```bash
# Test 5: Calculate Fare
curl -X POST "http://localhost:8000/api/bot/calculate" \
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

# Expected Response:
{
  "success": true,
  "estimatedFare": 20700,
  "distance": 115,
  "breakdown": {...}
}
```

- [ ] Test One Way trips
- [ ] Test Round Trip trips
- [ ] Test AC vs Non-AC pricing
- [ ] Test different passenger counts
- [ ] Test with stops included
- [ ] Verify fare calculation accuracy

---

## Frontend Testing

### Manual Testing

**Test Scenario 1: Basic Booking (No Stops)**
- [ ] Select Passenger service
- [ ] Select One Way trip
- [ ] Select 5 passengers
- [ ] Select Toyota Hiace vehicle
- [ ] Select AC option
- [ ] Enter "Colombo" as pickup
- [ ] Enter "Kandy" as destination
- [ ] Verify distance shows: 115 km
- [ ] Verify estimated amount shows: Rs. 20,700
- [ ] Click Calculate
- [ ] Verify final fare estimate

**Test Scenario 2: Round Trip**
- [ ] Select Passenger service
- [ ] Select Round Trip
- [ ] Select 5 passengers
- [ ] Select Toyota Hiace vehicle
- [ ] Select AC option
- [ ] Enter "Colombo" as pickup
- [ ] Enter "Kandy" as destination
- [ ] Verify distance shows: 115 km
- [ ] Verify estimated amount shows: Rs. 41,400 (115 × 2 × 180)
- [ ] Click Calculate

**Test Scenario 3: With Stops**
- [ ] Select Passenger service
- [ ] Select One Way trip
- [ ] Select 5 passengers
- [ ] Select Toyota Hiace vehicle
- [ ] Select AC option
- [ ] Enter "Colombo" as pickup
- [ ] Enter "Negombo" as Stop 1 (42 km)
- [ ] Enter "Kandy" as destination
- [ ] Verify total distance shows: 42 + 92 = 134 km
- [ ] Verify estimated amount: Rs. 24,120
- [ ] Click Calculate

**Test Scenario 4: Location Validation**
- [ ] Test entering "colmbo" (typo)
- [ ] Verify autocorrects to "Colombo"
- [ ] Test entering invalid location
- [ ] Verify shows suggestions
- [ ] Verify error handling

**Test Scenario 5: AC/Non-AC**
- [ ] Select vehicle with both AC and Non-AC
- [ ] Switch between AC and Non-AC
- [ ] Verify prices update correctly
- [ ] Select vehicle with only AC
- [ ] Verify AC/Non-AC step hidden

---

## Debugging Checklist

- [ ] **Database**: Verify vehicles and lorries imported
- [ ] **Services**: Verify LocationPredictorService has all 15+ locations
- [ ] **Coordinates**: Verify all locations have correct lat/lng
- [ ] **Routes**: Verify all routes registered in `routes/api.php`
- [ ] **CORS**: Verify CORS headers allow frontend requests
- [ ] **Error Handling**: Test all error scenarios (invalid input, not found, etc.)
- [ ] **Data Validation**: Verify passenger count limits (1-60)
- [ ] **Calculations**: Verify Haversine formula accuracy
- [ ] **Pricing**: Verify fare calculation with various scenarios
- [ ] **Performance**: Ensure response times < 500ms per endpoint

---

## Deployment Checklist

- [ ] All endpoints tested locally
- [ ] Error handling working for all scenarios
- [ ] Database properly seeded with vehicle/lorry data
- [ ] Frontend integrated with all endpoints
- [ ] Real-time distance display working
- [ ] Real-time amount calculation working
- [ ] WhatsApp booking link working
- [ ] Both chatbot and booking form tested end-to-end
- [ ] No console errors in browser dev tools
- [ ] API responses validated

---

## Quick Reference

| Endpoint | Called At | Triggers |
|----------|-----------|----------|
| `GET /api/vehicles` | Step 4 (Vehicle Select) | Load vehicle list |
| `POST /api/locations/suggest` | Step 7-8 (Location input) | Show autocomplete |
| `POST /api/bot/location` | Step 7-8 (Location blur) | Validate location |
| `POST /api/locations/distance` | Step 8 (After destination) | Show real-time distance & amount |
| `POST /api/bot/calculate` | Step 11 (Final estimate) | Calculate final fare |

---

**Implementation ready!** ✓
