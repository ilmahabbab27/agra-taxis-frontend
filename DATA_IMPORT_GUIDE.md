# Data Import & Calculation Guide

How to use the exported JSON data in both chatbot and booking form.

---

## Exported Data Structure

```json
{
  "exportedAt": "2026-06-09T07:08:21.681Z",
  "company": {
    "name": "Agra Taxis",
    "phone": "+94723003000",
    "whatsapp": "94723003000",
    "email": "info@agrataxis.com"
  },
  "lorries": [
    {
      "id": 1,
      "name": "Lorry Name",
      "category": "Lorries",
      "lorryRates": {
        "7ft": { "type": "7 FT", "start": 2500, "extra": 160, ... },
        "10.5ft": { "type": "10.5 FT", "start": 6000, "extra": 230, ... }
      }
    }
  ],
  "vehicles": [
    {
      "id": 1,
      "name": "Toyota Hiace",
      "seats": 14,
      "acPricePerKm": 180,
      "acHillPricePerKm": 220,
      "nonAcPricePerKm": 150,
      "nonAcHillPricePerKm": 180,
      "package1Prices": { "day1": {...} }
    }
  ]
}
```

---

## Data Flow

```
agra-taxis-export-2026-06-09.json
    ↓
Database Import (Backend)
    ├─ INSERT vehicles
    ├─ INSERT lorries
    └─ INSERT rates
    ↓
Both Use Same Data:
    ├─ Chatbot /bot/calculate
    └─ Booking Form /bot/calculate
```

---

## Backend Import Script

```php
<?php
// Import the exported JSON

$jsonFile = 'agra-taxis-export-2026-06-09.json';
$data = json_decode(file_get_contents($jsonFile), true);

// Import Vehicles
foreach ($data['vehicles'] as $vehicle) {
    Vehicle::create([
        'name' => $vehicle['name'],
        'category' => $vehicle['category'],
        'seats' => $vehicle['seats'],
        'ac_price_per_km' => $vehicle['acPricePerKm'],
        'ac_hill_price_per_km' => $vehicle['acHillPricePerKm'],
        'non_ac_price_per_km' => $vehicle['nonAcPricePerKm'],
        'non_ac_hill_price_per_km' => $vehicle['nonAcHillPricePerKm'],
        'ac_available' => $vehicle['acAvailable'],
        'non_ac_available' => $vehicle['nonAcAvailable'],
        'package1_prices' => json_encode($vehicle['package1Prices']),
    ]);
}

// Import Lorries
foreach ($data['lorries'] as $lorry) {
    Lorry::create([
        'name' => $lorry['name'],
        'category' => $lorry['category'],
        'rate_table' => json_encode($lorry['lorryRates']),
    ]);
}

// Update company info
Company::first()->update([
    'name' => $data['company']['name'],
    'phone' => $data['company']['phone'],
    'whatsapp' => $data['company']['whatsapp'],
    'email' => $data['company']['email'],
]);

echo "✓ Data imported successfully";
?>
```

---

## Minimal Data for Calculation

### For Chatbot /bot/calculate

**Minimum Required:**
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

**Optional:**
```json
{
  "stops": ["Negombo"],
  "date": "2026-06-15",
  "time": "10:00"
}
```

---

### For Booking Form

**Same as chatbot - only need:**
1. Service Type (Passenger/Lorry)
2. Pickup location name
3. Destination location name
4. Vehicle name
5. Passengers count
6. AC option
7. Days
8. Trip type

---

## What Gets Sent to /bot/calculate

### Chatbot Sends:
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

### Booking Form Sends:
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

**Same format - both interfaces send identical data!**

---

## Backend /bot/calculate Processing

```php
class BotController {
  public function calculate(Request $request) {
    $input = $request->all();
    
    // Get vehicle from database
    $vehicle = Vehicle::where('name', $input['vehicle'])->first();
    
    // Get location and validate
    $locationService = new LocationPredictorService();
    $pickup = $locationService->validateLocation($input['pickup']);
    $destination = $locationService->validateLocation($input['destination']);
    
    // Calculate distance
    $distance = $this->haversineDistance(
      $pickup['coordinates']['lat'],
      $pickup['coordinates']['lng'],
      $destination['coordinates']['lat'],
      $destination['coordinates']['lng']
    );
    
    // Get fare estimation service
    $fareService = new FareEstimationService();
    
    // Calculate fare
    $result = $fareService->estimatePassengerFare(
      $vehicle->toArray(),
      [
        'tripType' => $input['tripType'],
        'days' => $input['days'],
        'passengers' => $input['passengers'],
        'acOption' => $input['acOption']
      ],
      [
        'distanceKm' => $distance,
        'isHillCountry' => $destination['isHillCountry']
      ]
    );
    
    return response()->json($result);
  }
}
```

---

## Data Hierarchy

```
Vehicle / Lorry Data (Static)
    ↓
Location Data (Validated)
    ↓
Trip Details (User Input)
    ↓
Calculation Logic
    ↓
Fare Estimate (Output)
```

---

## Critical Fields from Export

### For Passenger Vehicles
```json
{
  "name": "Toyota Hiace",
  "seats": 14,
  "acPricePerKm": 180,
  "acHillPricePerKm": 220,
  "nonAcPricePerKm": 150,
  "nonAcHillPricePerKm": 180,
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
}
```

### For Lorries
```json
{
  "lorryRates": {
    "7ft": {
      "type": "7 FT",
      "hillExtraPerKm": 10,
      "start": 2500,
      "extra": 160,
      "upDown": 120,
      "between100And130": 2500,
      "maxUpDownKm": 150,
      "dropMaxKm": 130
    }
  }
}
```

---

## Both Interfaces Use Same Data

```
Chatbot                    Booking Form
    ↓                            ↓
Validates Location         Validates Location
    ├─ Uses LocationPredictorService
    ├─ Calls /bot/location
    ↓                            ↓
Collects Trip Details      Collects Trip Details
    ├─ Service Type, Vehicle, Passengers, AC, Days
    ↓                            ↓
Calls /bot/calculate       Calls /bot/calculate
    ├─ Same Request Format
    ├─ Same Database (Vehicles, Rates)
    ↓                            ↓
Gets Fare Estimate         Gets Fare Estimate
    └─ Same Calculation Logic
```

---

## Data Flow Summary

| Step | Data Source | Both Interfaces |
|------|-------------|-----------------|
| 1. Service Type | User Input | ✓ Same |
| 2. Location Validate | LocationPredictorService | ✓ Same |
| 3. Vehicle Data | Database (from export) | ✓ Same |
| 4. Trip Details | User Input | ✓ Same |
| 5. Calculation | FareEstimationService | ✓ Same |
| 6. Fare Estimate | Output | ✓ Same |

---

## Setup Steps

1. **Import Data to Database**
   ```bash
   php artisan import:agra-data agra-taxis-export-2026-06-09.json
   ```

2. **Verify Vehicles Imported**
   ```bash
   SELECT COUNT(*) FROM vehicles;  # Should show all vehicles
   ```

3. **Test /bot/location Endpoint**
   ```
   POST /bot/location
   { "location": "Colombo" }
   ✓ Should return validated location
   ```

4. **Test /bot/calculate Endpoint**
   ```
   POST /bot/calculate
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
   ✓ Should return fare estimate
   ```

5. **Both Interfaces Ready**
   - Chatbot uses same endpoints
   - Booking Form uses same endpoints
   - Same data, same calculation

---

## Minimal Data Checklist

For any calculation request, you ONLY need:

✅ Service Type (Passenger/Lorry)
✅ Pickup location name
✅ Destination location name
✅ Vehicle name
✅ Passenger count (if Passenger)
✅ AC option (if available)
✅ Days (default: 1)
✅ Trip type (default: One Way)

Everything else is:
- Looked up from database (vehicles, rates)
- Calculated by services (distance, fare)
- Optional (stops, date, time)

---

## Example Complete Flow

```
USER CHATBOT:
"Hello"
→ Bot: "Service type?"
→ User: "Passenger"
→ Bot: "Pickup?"
→ User: "colombo"
→ /bot/location validates → "Colombo"
→ Bot: "Destination?"
→ User: "kandy"
→ /bot/location validates → "Kandy"
→ Bot: "Passengers?"
→ User: "5"
→ Bot: "AC?"
→ User: "AC"
→ /bot/calculate with minimal data
→ Database lookups (vehicle rates, prices)
→ Calculation (distance, fare)
→ Response: "Rs. 18,000"

USER BOOKING FORM:
Step 0: Service → "Passenger"
Step 1: Trip Type → "One Way"
Step 2: Passengers → "5"
Step 3: Vehicle → "Toyota Hiace"
Step 4: AC → "AC"
Step 5: Pickup → "Colombo"
Step 6: Destination → "Kandy"
Step 7: Stops → None
Step 8: Details → (optional)
Step 9: Review → All data
Step 10: Calculate
→ /bot/calculate with same data
→ Response: "Rs. 18,000"
```

**Same result, different interface!** ✓

