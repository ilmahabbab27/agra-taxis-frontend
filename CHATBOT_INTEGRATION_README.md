# Agra Connect Chatbot Integration Guide

Complete documentation for integrating Agra Connect's fare estimation logic into your chatbot platform.

## 📁 Files in This Package

### 1. **CHATBOT_API_SPEC.md** (Complete Reference)
Comprehensive API specification including:
- Request/response formats for passenger and lorry fares
- Detailed calculation logic and formulas
- Error response examples
- Python and JavaScript integration examples
- Constants and defaults
- Sample chatbot responses

**When to use:** Full implementation, when you need all details and examples

---

### 2. **FARE_ESTIMATION_SERVICE.php** (Backend Implementation)
Laravel service class ready to drop into your backend:
- `estimatePassengerFare()` - Calculate passenger vehicle fares
- `estimateLorryFare()` - Calculate lorry service fares
- Input validation and error handling
- Example controller implementation
- Route setup instructions

**When to use:** Setting up the backend endpoints, implementing Laravel routes

---

### 3. **CHATBOT_QUICK_START.md** (Quick Reference)
Quick integration guide with:
- Minimal request/response examples
- Chatbot decision tree flowchart
- Key calculation formulas
- 3 real-world conversation examples
- Common chatbot questions & answers
- Integration checklist
- Rate update procedures
- Testing cases

**When to use:** Quick lookup, debugging, conversational patterns, team reference

---

### 4. **fare-estimation.types.ts** (TypeScript Definitions)
Type-safe type definitions for:
- All request/response structures
- Vehicle catalog and rate tables
- Chatbot helper types
- API client interface
- Usage examples with full typing

**When to use:** TypeScript/Node.js projects, better IDE support, type safety

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Copy Backend Service
```bash
# Copy FARE_ESTIMATION_SERVICE.php to your Laravel project
cp FARE_ESTIMATION_SERVICE.php app/Services/FareEstimationService.php
```

### Step 2: Create Routes
```php
// routes/api.php
Route::post('/estimate-passenger-fare', [FareEstimationController::class, 'estimatePassengerFare']);
Route::post('/estimate-lorry-fare', [FareEstimationController::class, 'estimateLorryFare']);
```

### Step 3: Create Controller
```php
namespace App\Http\Controllers\Api;

use App\Services\FareEstimationService;

class FareEstimationController extends Controller {
    public function estimatePassengerFare(Request $request) {
        $fareService = new FareEstimationService();
        $result = $fareService->estimatePassengerFare(
            $request->input('vehicle'),
            $request->input('tripDetails'),
            $request->input('route')
        );
        return response()->json($result);
    }
    
    public function estimateLorryFare(Request $request) {
        // Similar implementation for lorry
    }
}
```

### Step 4: Call from Chatbot
```javascript
async function getPassengerEstimate(vehicle, tripDetails, route) {
  const response = await fetch('http://localhost:8000/api/estimate-passenger-fare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vehicle, tripDetails, route })
  });
  return response.json();
}
```

---

## 📊 API Overview

### Endpoint 1: Passenger Vehicle Estimation
```
POST /api/estimate-passenger-fare

Request:
{
  "vehicle": { name, seats, acPricePerKm, nonAcPricePerKm, ... },
  "tripDetails": { tripType, days, passengers, acOption },
  "route": { distanceKm, isHillCountry }
}

Response:
{
  "estimatedFare": 15370,
  "breakdown": { "package1": {...}, "package2": {...} },
  "packageRecommendation": "package1"
}
```

**Use when:** Customer is looking to travel with passengers/family

---

### Endpoint 2: Lorry Service Estimation
```
POST /api/estimate-lorry-fare

Request:
{
  "lorryRates": { type, start, extra, upDown, between100And130, ... },
  "tripDetails": { tripType, days },
  "route": { distanceKm, isHillCountry }
}

Response:
{
  "estimatedFare": 2500,
  "breakdown": { "startCharge": 2500, "extraKmCharge": 0, ... }
}
```

**Use when:** Customer needs to transport cargo/goods

---

## 🎯 Chatbot Integration Points

### Decision Flow
```
User asks about transport
    ↓
Ask: "Passengers or Cargo?"
    ├─ PASSENGERS → Get vehicle details → /api/estimate-passenger-fare
    └─ CARGO → Get lorry type → /api/estimate-lorry-fare
```

### Key Information to Collect
- **Always:** Distance, Trip type (One way / Round trip)
- **Passenger:** Vehicle type, Passengers count, AC preference
- **Lorry:** Lorry size, Loading/Unloading requirements

### Hill Country Detection
Destinations: Kandy, Nuwara Eliya, Badulla, Matale, Dambulla, Bandarawela
- If pickup or destination in this list → `isHillCountry: true`
- Applies extra surcharge per km

---

## 💰 Pricing Rules Summary

### Passenger Vehicles
- **Base:** Per km rate (varies by AC/Non-AC and hill country)
- **Daily Package:** 150 km included per day
- **Extra KM:** Charged at per km rate beyond included distance
- **Two Packages Offered:**
  - Package 1: Daily rate + extra KM charges
  - Package 2: Pure distance-based
  - **Recommendation:** Usually Package 1 (cheaper for most routes)

### Lorry Services
- **One Way (≤100 km):** Flat start charge (e.g., Rs. 2,500)
- **One Way (100-130 km):** Special between rate (e.g., Rs. 2,500)
- **One Way (>130 km):** Start charge + extra KM charges
- **Round Trip:** Up/down charge + extra KM if beyond limit
- **Hill Country:** Extra Rs. 10/km surcharge

---

## 🔧 Configuration

### Vehicle Prices (Update in Database)
```sql
INSERT INTO vehicles (name, category, ac_price_per_km, non_ac_price_per_km, ...) VALUES (...)
```

### Lorry Rates (Update in Database)
```sql
INSERT INTO lorry_rates (type, start, extra, upDown, between100And130, ...) VALUES (...)
```

### Constants (In Service Code)
```php
const INCLUDED_KM_PER_DAY = 150;  // Per day package
const LORRY_DEFAULTS = [
    'maxUpDownKm' => 150,
    'dropMaxKm' => 130,
    'hillExtraPerKm' => 10,
];
```

---

## 🧪 Testing

### Test Passenger Estimate
```bash
curl -X POST http://localhost:8000/api/estimate-passenger-fare \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle": {"name": "Toyota Hiace", "acPricePerKm": 180, ...},
    "tripDetails": {"tripType": "One Way", "days": 1, "acOption": "AC"},
    "route": {"distanceKm": 85.5, "isHillCountry": false}
  }'
```

### Test Lorry Estimate
```bash
curl -X POST http://localhost:8000/api/estimate-lorry-fare \
  -H "Content-Type: application/json" \
  -d '{
    "lorryRates": {"type": "7 FT", "start": 2500, "extra": 160, ...},
    "tripDetails": {"tripType": "One Way", "days": 1},
    "route": {"distanceKm": 95.5, "isHillCountry": false}
  }'
```

---

## 📱 Sample Chatbot Responses

### Passenger Vehicle
```
🚗 Toyota Hiace (AC)
📍 Colombo → Kandy | 115 km
👥 9 Passengers
💰 Rs. 18,000 (Best price)

Includes: 150 km daily package
```

### Lorry Service
```
🚚 7 FT Lorry
📍 Colombo → Matara | 42 km  
📦 One Way
💰 Rs. 2,500

Start charge included, no extra distance charges
```

---

## ⚠️ Important Notes

1. **Distance Accuracy:** Chatbot should ask for specific locations for accurate distance estimation
2. **Hill Country:** Verify destination is actually in hill country (check GPS or confirmed list)
3. **Package Recommendation:** For 1-day trips, Package 1 is almost always recommended
4. **Lorry Pricing:** Different rules for round trip vs one way - be careful
5. **Rate Updates:** When rates change, all estimates use new rates automatically (no code changes)
6. **Fallback Rates:** Have default rates in case of database fetch failure

---

## 🔗 Related Files

- **Backend:** `c:\xampp\htdocs\Agra Taxis Backend\` (Laravel project)
- **Frontend:** `c:\Users\amjad\...spark\agra-connect\` (This project)
- **Database:** See your Laravel `.env` for DB credentials

---

## 📞 Support

For implementation help:
1. Check **CHATBOT_QUICK_START.md** for common patterns
2. Review **CHATBOT_API_SPEC.md** for technical details
3. Use **fare-estimation.types.ts** for type safety
4. Check **FARE_ESTIMATION_SERVICE.php** for backend logic

---

## ✅ Integration Checklist

- [ ] Copy FARE_ESTIMATION_SERVICE.php to backend
- [ ] Create API endpoints
- [ ] Test both endpoints with sample data
- [ ] Integrate with chatbot platform
- [ ] Add vehicle/lorry catalog caching
- [ ] Implement hill country detection
- [ ] Add error handling
- [ ] Monitor calculation accuracy
- [ ] Document rate change procedure
- [ ] Set up admin rate update interface
- [ ] Create logging for all estimates
- [ ] Deploy to production

---

**Last Updated:** June 2026
**Estimation Logic Version:** 1.0 (Frontend: BookingForm.tsx)
**Status:** Ready for Production
