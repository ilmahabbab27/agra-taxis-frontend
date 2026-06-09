# Backend Files - Verification Checklist

Files that need to be rechecked and clarified with server version.

---

## 🔴 CRITICAL FILES TO VERIFY

### 1. Controller Files

#### File: `app/Http/Controllers/Api/BookingApiController.php`
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] File exists in correct location
- [ ] Class name matches: `BookingApiController`
- [ ] Namespace: `App\Http\Controllers\Api`
- [ ] All 5 methods exist:
  - [ ] `getVehicles()`
  - [ ] `suggestLocations()`
  - [ ] `validateLocation()`
  - [ ] `calculateDistance()`
  - [ ] `calculateFare()`
- [ ] Helper methods exist:
  - [ ] `calculatePassengerFare()`
  - [ ] `calculateLorryFare()`
  - [ ] `getLorryRates()`
- [ ] Error handling matches API responses
- [ ] Vehicle model queries work correctly
- [ ] Response format matches documentation

**Question to ask server:**
```
Is BookingApiController.php the correct controller for all 5 endpoints?
Or are there separate controllers:
  - LocationController.php?
  - VehicleController.php?
  - FareController.php?
```

---

#### File: `app/Http/Controllers/Api/BotEndpoints.php`
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] File exists (if different from BookingApiController)
- [ ] Class name: `BotEndpoints` or something else?
- [ ] Methods:
  - [ ] `location()` for validation
  - [ ] `calculate()` for fare estimation
- [ ] Whether this is used or if BookingApiController is primary

**Question to ask server:**
```
Is BotEndpoints.php still in use, or has it been replaced by BookingApiController.php?
```

---

#### File: `app/Http/Controllers/ChatbotController.php`
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] File exists
- [ ] Class name: `ChatbotController`
- [ ] Methods for chatbot conversation flow
- [ ] Whether it uses the same API endpoints as booking form
- [ ] Webhook/message handling methods

**Question to ask server:**
```
Does ChatbotController.php exist and what methods does it have?
Does it call the same BookingApiController endpoints or separate ones?
```

---

### 2. Service Classes

#### File: `app/Services/LocationPredictorService.php`
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] File exists in `app/Services/` directory
- [ ] Class name: `LocationPredictorService`
- [ ] All required methods:
  - [ ] `autocomplete($query, $limit)`
  - [ ] `validateLocation($location)`
  - [ ] `calculateDistance($from, $to)`
  - [ ] `isHillCountry($location)`
- [ ] Location database/array has 15+ locations:
  - [ ] Colombo, Kandy, Galle, Negombo, Chilaw
  - [ ] Kurunegala, Matara, Kalutara, Anuradhapura, Jaffna
  - [ ] Batticaloa, Trincomalee, Nuwara Eliya, Ratnapura, Badulla
- [ ] Each location has:
  - [ ] Name
  - [ ] Latitude/Longitude coordinates
  - [ ] District
  - [ ] isHillCountry flag
- [ ] Fuzzy matching for typos working
- [ ] Haversine formula for distance calculation

**Questions to ask server:**
```
1. What's the exact location of LocationPredictorService.php?
2. How many locations are stored and how?
   - In array?
   - In database table?
   - In JSON file?
3. Are all 15+ locations with coordinates present?
4. Does typo correction work (e.g., "colmbo" → "Colombo")?
5. How is hill country detection implemented?
```

---

#### File: `app/Services/FareEstimationService.php`
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] File exists in `app/Services/` directory
- [ ] Class name: `FareEstimationService`
- [ ] Methods:
  - [ ] `estimatePassengerFare($vehicle, $options, $distance)`
  - [ ] `estimateLorryFare($rates, $options, $distance)`
- [ ] Passenger pricing logic:
  - [ ] AC: Rs. 180/km normal, Rs. 220/km hill
  - [ ] Non-AC: Rs. 150/km normal, Rs. 180/km hill
  - [ ] Hill country surcharge calculated
- [ ] Round trip multiplier (×2 distance)
- [ ] Lorry pricing:
  - [ ] 7ft base: Rs. 2,500 + Rs. 160/km
  - [ ] 10.5ft base: Rs. 6,000 + Rs. 230/km
  - [ ] Hill surcharge: +Rs. 10/km
- [ ] Breakdown format matches API response

**Questions to ask server:**
```
1. Is FareEstimationService.php the correct service class?
2. What's the exact pricing for:
   - AC vehicles (normal and hill)?
   - Non-AC vehicles (normal and hill)?
   - Lorry types and rates?
3. How is round trip pricing calculated?
4. How are stops handled in distance calculation?
5. What's the exact breakdown format returned?
```

---

### 3. Routes Configuration

#### File: `routes/api.php`
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] All 5 endpoints registered:
  - [ ] `GET /api/vehicles`
  - [ ] `GET /api/vehicles?passengers=X`
  - [ ] `POST /api/locations/suggest`
  - [ ] `POST /api/bot/location`
  - [ ] `POST /api/locations/distance`
  - [ ] `POST /api/bot/calculate`
- [ ] Correct controller referenced
- [ ] Correct method names
- [ ] Route grouping with `/api` prefix
- [ ] CORS enabled for frontend domain

**Questions to ask server:**
```
1. Is the current routes/api.php set up with these exact endpoints?
2. What's the actual route prefix being used?
3. Are there any middleware applied (CORS, auth, rate limiting)?
4. Are the route names set? (for named routes)
```

---

### 4. Models & Database

#### File: `app/Models/Vehicle.php`
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] Model exists
- [ ] Table name: `vehicles`
- [ ] All fields present:
  - [ ] id, name, seats, category
  - [ ] ac_price_per_km, non_ac_price_per_km
  - [ ] ac_hill_price_per_km, non_ac_hill_price_per_km
  - [ ] ac_available, non_ac_available
  - [ ] package1_prices (JSON)
- [ ] Relationships (if any)
- [ ] Casting for JSON fields

**Question to ask server:**
```
1. What fields does the Vehicle model actually have?
2. Is package1_prices stored as JSON?
3. What's the table schema exactly?
4. Are there any relationships to Lorry or other models?
```

---

#### File: `app/Models/Lorry.php`
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] Model exists
- [ ] Table name: `lorries`
- [ ] Fields:
  - [ ] id, name, category
  - [ ] rate_table (JSON with 7ft, 10.5ft rates)
- [ ] Relationships

**Question to ask server:**
```
1. Does Lorry.php model exist?
2. How is rate_table structured in the database?
3. What fields does it have?
```

---

#### File: `database/migrations/CreateVehiclesTable.php`
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] Migration file exists
- [ ] All vehicle fields in schema
- [ ] Data types correct
- [ ] Indexes set up
- [ ] Migration has been run

**Question to ask server:**
```
1. What's the exact database schema for vehicles table?
2. Have all migrations been run?
3. What are the default values for each field?
```

---

#### File: `database/migrations/CreateLoiriesTable.php`
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] Migration exists for lorries table
- [ ] Fields match Lorry model
- [ ] JSON column properly defined

**Question to ask server:**
```
1. What's the schema for lorries table?
2. How is rate_table JSON structured exactly?
```

---

### 5. Data Import

#### Data: Imported Vehicle & Lorry Data
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] JSON export file received: `agra-taxis-export-2026-06-09.json`
- [ ] Data has been imported to database
- [ ] Verify count of records:
  - [ ] How many vehicles in database?
  - [ ] How many lorries in database?
- [ ] Sample vehicle record structure
- [ ] Sample lorry record structure

**Questions to ask server:**
```
1. Has the JSON data been imported to the database?
2. How many vehicle records exist?
3. How many lorry records exist?
4. What's a sample vehicle record look like?
5. What's a sample lorry record look like?
6. Are coordinates correct for all locations?
```

---

## 🟡 OPTIONAL ENHANCEMENTS

### File: `app/Services/WhatsAppService.php`
**Status:** ❓ OPTIONAL

**What to check:**
- [ ] Does this service exist?
- [ ] If yes, what does it do?

**Question to ask server:**
```
Is there a WhatsAppService.php for sending booking confirmations?
Or is WhatsApp handled entirely on frontend?
```

---

### File: `app/Services/SMSService.php`
**Status:** ❓ OPTIONAL

**What to check:**
- [ ] Does this service exist?
- [ ] For sending booking confirmations?

**Question to ask server:**
```
Is SMS sending implemented on backend?
```

---

### File: `app/Jobs/SendBookingConfirmation.php`
**Status:** ❓ OPTIONAL

**What to check:**
- [ ] Does async job processing exist?

**Question to ask server:**
```
Are there queued jobs for booking confirmations?
```

---

## 🟢 VERIFICATION SCRIPT

Create a test script to verify backend files:

### `tests/Feature/ApiEndpointsTest.php`

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiEndpointsTest extends TestCase
{
    public function test_get_vehicles_endpoint()
    {
        $response = $this->get('/api/vehicles?passengers=5');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'id', 'name', 'seats', 'acPricePerKm', 'nonAcPricePerKm'
                ]
            ]
        ]);
    }

    public function test_location_validation()
    {
        $response = $this->post('/api/bot/location', [
            'location' => 'colombo'
        ]);
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'location',
            'coordinates' => ['lat', 'lng'],
            'isHillCountry'
        ]);
    }

    public function test_fare_calculation()
    {
        $response = $this->post('/api/bot/calculate', [
            'serviceType' => 'Passenger',
            'pickup' => 'Colombo',
            'destination' => 'Kandy',
            'vehicle' => 'Toyota Hiace',
            'passengers' => 5,
            'acOption' => 'AC',
            'tripType' => 'One Way'
        ]);
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'estimatedFare',
            'distance',
            'breakdown'
        ]);
    }
}
```

Run tests:
```bash
php artisan test --filter=ApiEndpointsTest
```

---

## 📋 CHECKLIST FOR SERVER VERIFICATION

Print this and verify each item:

```
BACKEND FILES VERIFICATION CHECKLIST
====================================

CONTROLLERS:
  [ ] app/Http/Controllers/Api/BookingApiController.php exists
      - [ ] getVehicles() method
      - [ ] suggestLocations() method
      - [ ] validateLocation() method
      - [ ] calculateDistance() method
      - [ ] calculateFare() method

SERVICES:
  [ ] app/Services/LocationPredictorService.php exists
      - [ ] autocomplete() method
      - [ ] validateLocation() method
      - [ ] calculateDistance() method
      - [ ] 15+ locations with coordinates
  
  [ ] app/Services/FareEstimationService.php exists
      - [ ] estimatePassengerFare() method
      - [ ] estimateLorryFare() method

MODELS:
  [ ] app/Models/Vehicle.php exists with all fields
  [ ] app/Models/Lorry.php exists with all fields

ROUTES:
  [ ] routes/api.php has all 5 endpoints registered
  [ ] CORS enabled for frontend

DATABASE:
  [ ] vehicles table exists with correct schema
  [ ] lorries table exists with correct schema
  [ ] Vehicle data imported (count: ___ )
  [ ] Lorry data imported (count: ___ )

LOCATIONS:
  [ ] All 15+ major locations in database/service
  [ ] Coordinates correct for all locations
  [ ] Hill country flags correct

PRICING:
  [ ] AC rates: Rs. 180/km (normal), Rs. 220/km (hill)
  [ ] Non-AC rates: Rs. 150/km (normal), Rs. 180/km (hill)
  [ ] Lorry 7ft: Rs. 2,500 start + Rs. 160/km
  [ ] Lorry 10.5ft: Rs. 6,000 start + Rs. 230/km

TESTING:
  [ ] All endpoints return correct response format
  [ ] Error handling returns proper error codes
  [ ] Distance calculation works correctly
  [ ] Fare calculation matches expected values
```

---

## 🎯 QUESTIONS TO ASK SERVER TEAM

### Architecture
```
1. What's the main controller for API endpoints?
2. Are services used for business logic (location, fare)?
3. What's the database schema exactly?
4. How is location data stored (array, DB table, JSON)?
5. How is vehicle/lorry data stored and accessed?
```

### Verification
```
6. Can you export the actual Database schema?
7. Can you show sample Vehicle and Lorry records?
8. How many locations are currently in the system?
9. What are the exact GPS coordinates for each location?
10. Are hill country flags set correctly?
```

### Pricing
```
11. What are the actual rates for:
    - AC vehicles (normal and hill)?
    - Non-AC vehicles (normal and hill)?
    - Lorry types?
12. How is round trip pricing calculated?
13. Are there any surcharges or special fees?
14. How are multiple stops handled?
```

### Implementation
```
15. Which Laravel version is being used?
16. Are there any custom middleware or macros?
17. What's the error handling pattern?
18. Are there rate limits on API endpoints?
19. Is CORS enabled? For which domains?
```

---

## 🚀 NEXT STEPS

1. **Print this checklist**
2. **Share with server team**
3. **Get answers to all questions**
4. **Verify file locations match**
5. **Export actual database schema**
6. **Run verification tests**
7. **Update documentation if differences found**
8. **Deploy with confidence!**

---

**All backend files should be verified before going to production!**
