# Endpoints Integration Guide - Smart Booking Flow

Complete guide to using all endpoints in the smart 9-step booking flow.

---

## Endpoint Summary

| Endpoint | Method | Purpose | When Used |
|----------|--------|---------|-----------|
| `/api/vehicles` | GET | Get vehicle list (filtered by passengers) | Step 2 (Vehicle Selection) |
| `/api/locations/suggest` | POST | Autocomplete location suggestions | Step 6-7 (Pickup/Drop) |
| `/api/bot/location` | POST | Validate location | Step 6-7 (Pickup/Drop) |
| `/api/locations/distance` | POST | Calculate distance between locations | Step 7 (Real-time display) |
| `/api/bot/calculate` | POST | Calculate final fare estimate | Step 8-9 (Review/Estimate) |

---

## Flow Breakdown by Step

### STEP 1: Passenger Count (1-60)
**No API call needed**
- User selects 1-60 passengers
- Frontend stores: `passengers: number`

---

### STEP 2: Vehicle Selection
**API Call 1: Get Vehicles**

```javascript
// Filter vehicles by passenger count
const response = await fetch('/api/vehicles?passengers=5');
const data = await response.json();

// Response:
{
  success: true,
  data: [
    {
      id: 1,
      name: "Toyota Hiace",
      seats: 14,
      category: "Minibus",
      acPricePerKm: 180,
      nonAcPricePerKm: 150,
      acAvailable: true,
      nonAcAvailable: true
    },
    { /* more vehicles */ }
  ],
  count: 5,
  filtered: true
}

// Frontend stores: vehicle object
```

---

### STEP 3: AC/Non-AC Option
**No API call needed**
- Show only if `vehicle.acAvailable && vehicle.nonAcAvailable`
- Frontend stores: `acOption: "AC" | "Non-AC"`

---

### STEP 4: Trip Type (One Way / Round Trip)
**No API call needed**
- Frontend stores: `tripType: "One Way" | "Round Trip"`

---

### STEP 5: Date & Time (Optional)
**No API call needed**
- Frontend stores: `date: "2026-06-15"`, `time: "10:00"`

---

### STEP 6: Pickup Location
**API Call 2a: Location Suggestions**

```javascript
// As user types
const response = await fetch('/api/locations/suggest', {
  method: 'POST',
  body: JSON.stringify({ query: "kan", limit: 5 })
});

// Response:
{
  success: true,
  query: "kan",
  suggestions: [
    { location: "Kandy", confidence: 0.95 },
    { location: "Kandapolit", confidence: 0.85 }
  ],
  count: 2
}

// Show as autocomplete dropdown
```

**API Call 2b: Validate Location**

```javascript
// After user selects location
const response = await fetch('/api/bot/location', {
  method: 'POST',
  body: JSON.stringify({ location: "kan" })
});

// Response:
{
  success: true,
  location: "Kandy",
  coordinates: { lat: 6.9271, lng: 80.7789 },
  district: "Central",
  isHillCountry: true,
  confidence: 0.95
}

// Frontend stores: 
// pickup: "Kandy"
// pickupCoordinates: { lat, lng }
// pickupIsHillCountry: true
```

---

### STEP 7: Drop Location (with Real-Time Amount Display)
**API Call 3a: Location Validation**

```javascript
// Same as step 6
const response = await fetch('/api/bot/location', {
  method: 'POST',
  body: JSON.stringify({ location: "colombo" })
});

// Response:
{
  success: true,
  location: "Colombo",
  coordinates: { lat: 6.9271, lng: 79.8612 },
  district: "Western",
  isHillCountry: false,
  confidence: 0.98
}

// Frontend stores:
// destination: "Colombo"
// destinationCoordinates: { lat, lng }
// destinationIsHillCountry: false
```

**API Call 3b: Calculate Distance (Real-Time)**

```javascript
// Immediately after destination is set
const response = await fetch('/api/locations/distance', {
  method: 'POST',
  body: JSON.stringify({
    from: "Kandy",
    to: "Colombo"
  })
});

// Response:
{
  success: true,
  from: "Kandy",
  to: "Colombo",
  distance_km: 115,
  is_hill_country_route: true,
  estimated_travel_time_hours: 2.5,
  pickup_hill_country: true,
  destination_hill_country: false
}

// Frontend stores: distance_km: 115
// Frontend calculates: amount = distance_km × pricePerKm
// For "AC": 115 × 180 = Rs. 20,700
// Show in real-time!
```

---

### STEP 8: Review Summary
**No new API call**
- Display collected data:
  - Passengers: 5
  - Vehicle: Toyota Hiace (AC)
  - Pickup: Kandy
  - Destination: Colombo
  - Distance: 115 km
  - Estimated Fare: Rs. 20,700

---

### STEP 9: Get Final Estimate
**API Call 4: Calculate Fare**

```javascript
// Final calculation with all details
const response = await fetch('/api/bot/calculate', {
  method: 'POST',
  body: JSON.stringify({
    serviceType: "Passenger",
    pickup: "Kandy",
    destination: "Colombo",
    vehicle: "Toyota Hiace",
    passengers: 5,
    acOption: "AC",
    days: 1,
    tripType: "One Way",
    date: "2026-06-15",
    time: "10:00"
  })
});

// Response:
{
  success: true,
  serviceType: "Passenger",
  estimatedFare: 20700,
  distance: 115,
  isHillCountry: true,
  breakdown: {
    baseFare: 18000,
    hillSurcharge: 2700,
    total: 20700
  },
  pricePerKm: 180,
  vehicle: "Toyota Hiace",
  passengers: 5,
  acOption: "AC",
  days: 1,
  tripType: "One Way"
}

// Display confirmation
```

---

## Complete Frontend Flow in TypeScript

```typescript
import { useState } from "react";

interface BookingState {
  passengers: number;
  vehicle: string;
  acOption: "AC" | "Non-AC";
  tripType: "One Way" | "Round Trip";
  pickup: string;
  destination: string;
  pickupCoordinates?: { lat: number; lng: number };
  destinationCoordinates?: { lat: number; lng: number };
  distance?: number;
  estimatedAmount?: number;
  date?: string;
  time?: string;
}

export function SmartBookingForm() {
  const [form, setForm] = useState<BookingState>({
    passengers: 1,
    vehicle: "",
    acOption: "AC",
    tripType: "One Way",
    pickup: "",
    destination: ""
  });
  const [step, setStep] = useState(0);

  // STEP 2: Get Vehicles
  async function handlePassengerSelect(passengers: number) {
    setForm(prev => ({ ...prev, passengers }));

    const response = await fetch(`/api/vehicles?passengers=${passengers}`);
    const data = await response.json();

    if (data.success) {
      // Show filtered vehicles
      setFilteredVehicles(data.data);
    }
  }

  // STEP 6: Validate Pickup
  async function handlePickupValidation(location: string) {
    const response = await fetch('/api/bot/location', {
      method: 'POST',
      body: JSON.stringify({ location })
    });

    const data = await response.json();
    if (data.success) {
      setForm(prev => ({
        ...prev,
        pickup: data.location,
        pickupCoordinates: data.coordinates
      }));
    }
  }

  // STEP 7: Validate Destination & Calculate Distance
  async function handleDestinationValidation(location: string) {
    // Step 1: Validate location
    const locResponse = await fetch('/api/bot/location', {
      method: 'POST',
      body: JSON.stringify({ location })
    });

    const locData = await locResponse.json();
    if (!locData.success) return;

    setForm(prev => ({
      ...prev,
      destination: locData.location,
      destinationCoordinates: locData.coordinates
    }));

    // Step 2: Calculate distance
    const distResponse = await fetch('/api/locations/distance', {
      method: 'POST',
      body: JSON.stringify({
        from: form.pickup,
        to: locData.location
      })
    });

    const distData = await distResponse.json();
    if (distData.success) {
      // Get price per km from vehicle
      const pricePerKm = form.acOption === "AC" ? 180 : 150;
      const estimatedAmount = distData.distance_km * pricePerKm;

      setForm(prev => ({
        ...prev,
        distance: distData.distance_km,
        estimatedAmount
      }));
    }
  }

  // STEP 9: Final Calculation
  async function handleCalculate() {
    const response = await fetch('/api/bot/calculate', {
      method: 'POST',
      body: JSON.stringify({
        serviceType: "Passenger",
        pickup: form.pickup,
        destination: form.destination,
        vehicle: form.vehicle,
        passengers: form.passengers,
        acOption: form.acOption,
        days: 1,
        tripType: form.tripType,
        date: form.date,
        time: form.time
      })
    });

    const data = await response.json();
    if (data.success) {
      // Show final estimate
      setEstimate({
        fare: data.estimatedFare,
        breakdown: data.breakdown,
        distance: data.distance
      });
    }
  }

  return (
    <div>
      {/* Step components... */}
    </div>
  );
}
```

---

## Error Handling

### Location Validation Errors

```javascript
if (!data.success) {
  if (data.error === 'EMPTY_INPUT') {
    showError("Please enter a location");
  } else if (data.error === 'LOCATION_NOT_FOUND') {
    showSuggestions(data.suggestions);
  } else if (data.error === 'VALIDATION_ERROR') {
    showError("Could not validate location");
  }
}
```

### Distance Calculation Errors

```javascript
if (!data.success) {
  if (data.error === 'MISSING_LOCATIONS') {
    showError("Both pickup and destination required");
  } else if (data.error === 'DISTANCE_CALCULATION_FAILED') {
    showError("Could not calculate distance");
  }
}
```

### Fare Calculation Errors

```javascript
if (!data.success) {
  if (data.error === 'MISSING_LOCATIONS') {
    showError("Invalid pickup or destination");
  } else if (data.error === 'VEHICLE_NOT_FOUND') {
    showError("Selected vehicle no longer available");
  } else if (data.error === 'CALCULATION_ERROR') {
    showError("Could not calculate fare");
  }
}
```

---

## With Stops (Optional Enhancement)

Add stops in STEP 7 (before final destination):

```javascript
// Request includes stops array
const response = await fetch('/api/bot/calculate', {
  method: 'POST',
  body: JSON.stringify({
    // ... other fields ...
    stops: ["Negombo", "Chilaw"],
    // ...
  })
});

// Backend calculates:
// Total Distance = Distance(Pickup→Stop1) + Distance(Stop1→Stop2) + Distance(Stop2→Destination)
// Fare = Total Distance × Price Per Km
```

---

## Real-Time Pricing Display

**During STEP 7 (Destination Selection):**

```
┌─────────────────────────────────────┐
│ PICKUP: Kandy                       │
│ DESTINATION: Colombo ✓              │
│ DISTANCE: 115 km                    │
│ PRICE/KM: Rs. 180                   │
│ ─────────────────────────────────── │
│ ESTIMATED AMOUNT: Rs. 20,700        │
└─────────────────────────────────────┘
```

As user types destination:
1. Autocomplete suggestions appear
2. User selects location
3. Backend validates location
4. Distance is calculated (real-time)
5. Amount updates instantly

---

## Request/Response Sizes

| Endpoint | Avg Request | Avg Response | Notes |
|----------|-------------|--------------|-------|
| `/api/vehicles` | 50 bytes | 2-5 KB | Depends on # of vehicles |
| `/api/locations/suggest` | 50 bytes | 200 bytes | 5 suggestions max |
| `/api/bot/location` | 50 bytes | 300 bytes | Single location |
| `/api/locations/distance` | 60 bytes | 300 bytes | Two locations |
| `/api/bot/calculate` | 200 bytes | 400-500 bytes | Complete booking |

**Total for complete booking: ~4.5 KB**

---

## Testing All Endpoints

### Test Sequence

```bash
# 1. Get vehicles
curl -X GET "http://localhost:8000/api/vehicles?passengers=5" \
  -H "Content-Type: application/json"

# 2. Get location suggestions
curl -X POST "http://localhost:8000/api/locations/suggest" \
  -H "Content-Type: application/json" \
  -d '{"query": "kan", "limit": 5}'

# 3. Validate location
curl -X POST "http://localhost:8000/api/bot/location" \
  -H "Content-Type: application/json" \
  -d '{"location": "Kandy"}'

# 4. Calculate distance
curl -X POST "http://localhost:8000/api/locations/distance" \
  -H "Content-Type: application/json" \
  -d '{"from": "Kandy", "to": "Colombo"}'

# 5. Calculate fare
curl -X POST "http://localhost:8000/api/bot/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Passenger",
    "pickup": "Kandy",
    "destination": "Colombo",
    "vehicle": "Toyota Hiace",
    "passengers": 5,
    "acOption": "AC",
    "days": 1,
    "tripType": "One Way"
  }'
```

---

## Performance Tips

✅ **Cache vehicle list** for 30 minutes
✅ **Debounce location autocomplete** (300ms)
✅ **Validate destination only after user selection** (not every keystroke)
✅ **Calculate distance immediately after destination validation**
✅ **Use real-time calculation for amount display** (don't wait for final estimate)
✅ **Pre-cache frequently searched locations**

---

## Both Interfaces Use Same Endpoints

```
Chatbot                    Booking Form
   ↓                            ↓
/api/locations/suggest     /api/locations/suggest
   ↓                            ↓
/api/bot/location          /api/bot/location
   ↓                            ↓
/api/locations/distance    /api/locations/distance
   ↓                            ↓
/api/bot/calculate         /api/bot/calculate
   ↓                            ↓
Estimate: Rs. 20,700       Estimate: Rs. 20,700
   ✓ Same calculation!
```

---

**Endpoints complete and ready to use!** ✓
