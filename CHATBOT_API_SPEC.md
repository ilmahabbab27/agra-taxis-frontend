# Agra Connect - Chatbot Fare Estimation API

This document provides the API specification for integrating Agra Connect's fare estimation logic into chatbot endpoints.

---

## Overview

Two main endpoints handle fare estimation:
1. **Passenger Vehicle Estimation** - Cars, vans, SUVs, minibuses, buses
2. **Lorry Service Estimation** - Commercial vehicle transportation

---

## 1. Passenger Vehicle Fare Estimation

### Endpoint
```
POST /api/estimate-passenger-fare
```

### Request Format

```json
{
  "vehicle": {
    "name": "Toyota Hiace",
    "seats": 14,
    "category": "Mini Buses",
    "acAvailable": true,
    "nonAcAvailable": true,
    "acPricePerKm": 180,
    "acHillPricePerKm": 220,
    "nonAcPricePerKm": 150,
    "nonAcHillPricePerKm": 180,
    "package1Prices": {
      "day1": {
        "acNormal": 15000,
        "acHill": 18000,
        "nonAcNormal": 12000,
        "nonAcHill": 14000
      },
      "day2": {
        "acNormal": 28000,
        "acHill": 33000,
        "nonAcNormal": 22000,
        "nonAcHill": 26000
      }
    }
  },
  "tripDetails": {
    "tripType": "One Way",  // "One Way" or "Round Trip"
    "days": 1,
    "passengers": 8,
    "acOption": "AC"  // "AC" or "Non AC"
  },
  "route": {
    "distanceKm": 85.5,
    "pickupHillCountry": false,
    "destinationHillCountry": true,
    "isHillCountry": true  // true if either pickup or destination is hill country
  }
}
```

### Request Parameters Explanation

| Field | Type | Description |
|-------|------|-------------|
| `vehicle.name` | string | Vehicle name/identifier |
| `vehicle.seats` | number | Seating capacity |
| `vehicle.acPricePerKm` | number | AC rate per km (normal area) |
| `vehicle.acHillPricePerKm` | number | AC rate per km (hill country) |
| `vehicle.nonAcPricePerKm` | number | Non-AC rate per km (normal area) |
| `vehicle.nonAcHillPricePerKm` | number | Non-AC rate per km (hill country) |
| `tripDetails.tripType` | string | "One Way" or "Round Trip" |
| `tripDetails.days` | number | Number of days (for multi-day packages) |
| `tripDetails.passengers` | number | Number of passengers |
| `tripDetails.acOption` | string | "AC" or "Non AC" |
| `route.distanceKm` | number | Total distance in kilometers |
| `route.isHillCountry` | boolean | Whether route includes hill country |

### Response Format

```json
{
  "success": true,
  "data": {
    "estimatedFare": 15370,
    "breakdown": {
      "package1": {
        "estimate": 15370,
        "description": "Day package (150km included per day)",
        "calculation": {
          "dailyPackageCharge": 15000,
          "days": 1,
          "packageBaseCharge": 15000,
          "additionalKm": -64.5,
          "additionalKmCharge": 0,
          "total": 15370
        }
      },
      "package2": {
        "estimate": 15399,
        "description": "Pure distance-based (per km)",
        "calculation": {
          "distanceKm": 85.5,
          "ratePerKm": 180,
          "total": 15399
      }
    },
    "packageRecommendation": "package1",
    "pricePerKm": 180,
    "hillCountrySurcharge": true,
    "includedKm": 150,
    "totalDistance": 85.5,
    "billableKm": 85.5,
    "additionalKm": 0,
    "days": 1,
    "currency": "LKR"
  },
  "meta": {
    "timestamp": "2026-06-09T12:00:00Z",
    "estimationType": "passenger",
    "vehicleName": "Toyota Hiace",
    "tripType": "One Way",
    "acOption": "AC"
  }
}
```

### Calculation Logic (Passenger)

```
CONSTANTS:
  INCLUDED_KM_PER_DAY = 150

INPUTS:
  totalKm = route.distanceKm
  days = tripDetails.days
  acOption = tripDetails.acOption
  isHillCountry = route.isHillCountry

CALCULATIONS:
  1. includedKm = days × INCLUDED_KM_PER_DAY
  
  2. billableKm = min(totalKm, includedKm)
  
  3. additionalKm = max(0, totalKm - includedKm)
  
  4. Get pricePerKm based on AC option and hill country:
     if acOption === "AC":
       pricePerKm = isHillCountry ? vehicle.acHillPricePerKm : vehicle.acPricePerKm
     else:
       pricePerKm = isHillCountry ? vehicle.nonAcHillPricePerKm : vehicle.nonAcPricePerKm
  
  5. Get package charge from vehicle.package1Prices[`day${days}`]
  
  6. Calculate estimates:
     if days === 1:
       package1Estimate = oneDayPackageCharge + (additionalKm × pricePerKm)
       package2Estimate = totalKm × pricePerKm
     else:
       package1Estimate = (packageCharge × days) + (additionalKm × pricePerKm)
       package2Estimate = totalKm × pricePerKm
  
  7. recommendedFare = package1Estimate (for 1-day trips)
```

### Example Request

```bash
curl -X POST http://localhost:8000/api/estimate-passenger-fare \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle": {
      "name": "Toyota Hiace",
      "seats": 14,
      "category": "Mini Buses",
      "acAvailable": true,
      "nonAcAvailable": true,
      "acPricePerKm": 180,
      "acHillPricePerKm": 220,
      "nonAcPricePerKm": 150,
      "nonAcHillPricePerKm": 180,
      "package1Prices": {
        "day1": {
          "acNormal": 15000,
          "acHill": 18000,
          "nonAcNormal": 12000,
          "nonAcHill": 14000
        }
      }
    },
    "tripDetails": {
      "tripType": "One Way",
      "days": 1,
      "passengers": 8,
      "acOption": "AC"
    },
    "route": {
      "distanceKm": 85.5,
      "pickupHillCountry": false,
      "destinationHillCountry": true,
      "isHillCountry": true
    }
  }'
```

---

## 2. Lorry Service Fare Estimation

### Endpoint
```
POST /api/estimate-lorry-fare
```

### Request Format

```json
{
  "lorryType": "7ft",
  "lorryRates": {
    "type": "7 FT",
    "hillExtraPerKm": 10,
    "start": 2500,
    "extra": 160,
    "upDown": 120,
    "waiting": 600,
    "waitingHour": 600,
    "between100And130": 2500,
    "maxUpDownKm": 150,
    "dropMinKm": 100,
    "dropMaxKm": 130
  },
  "tripDetails": {
    "tripType": "One Way",  // "One Way" or "Round Trip"
    "days": 1
  },
  "route": {
    "distanceKm": 95.5,
    "isHillCountry": false
  }
}
```

### Request Parameters Explanation

| Field | Type | Description |
|-------|------|-------------|
| `lorryType` | string | Lorry size identifier (7ft, 8.5ft, 10.5ft, etc.) |
| `lorryRates.start` | number | Starting charge for the drop |
| `lorryRates.extra` | number | Rate per km for extra distance |
| `lorryRates.upDown` | number | Up & down charge for round trips |
| `lorryRates.between100And130` | number | Flat rate for 100-130 km range |
| `lorryRates.hillExtraPerKm` | number | Hill country surcharge per km |
| `lorryRates.maxUpDownKm` | number | Maximum km for up/down rate (round trip) |
| `lorryRates.dropMaxKm` | number | Maximum km for start charge (one way) |
| `tripDetails.tripType` | string | "One Way" or "Round Trip" |
| `tripDetails.days` | number | Number of days |
| `route.distanceKm` | number | Total distance in kilometers |
| `route.isHillCountry` | boolean | Whether route includes hill country |

### Response Format

```json
{
  "success": true,
  "data": {
    "estimatedFare": 17660,
    "breakdown": {
      "startCharge": 2500,
      "extraKm": 0,
      "extraKmCharge": 0,
      "hillSurcharge": 955,
      "total": 17660
    },
    "priceDetails": {
      "lorryType": "7 FT",
      "startCharge": 2500,
      "extraKmRate": 160,
      "hillExtraPerKm": 10,
      "totalKm": 95.5,
      "hillSurchargeCalculation": "95.5 km × Rs. 10/km = Rs. 955"
    },
    "tripType": "One Way",
    "isRoundTrip": false,
    "applicablePricingRule": "standard_drop",
    "distanceKm": 95.5,
    "daysMultiplier": 1,
    "currency": "LKR"
  },
  "meta": {
    "timestamp": "2026-06-09T12:00:00Z",
    "estimationType": "lorry",
    "lorrySize": "7 FT"
  }
}
```

### Calculation Logic (Lorry)

```
CONSTANTS:
  maxUpDownKm = lorryRates.maxUpDownKm (default: 150)
  dropMaxKm = lorryRates.dropMaxKm (default: 130)

INPUTS:
  totalKm = route.distanceKm
  tripType = tripDetails.tripType
  days = tripDetails.days
  isHillCountry = route.isHillCountry
  rates = lorryRates

CALCULATIONS:
  1. Determine start charge based on trip type and distance:
  
     if tripType === "Round Trip":
       if totalKm <= maxUpDownKm:
         startCharge = rates.upDown
       else:
         startCharge = rates.upDown
         extraKm = max(totalKm - maxUpDownKm, 0)
         extraCharge = extraKm × rates.extra
     
     else (One Way):
       if 100 ≤ totalKm ≤ 130 AND rates.between100And130 exists:
         startCharge = rates.between100And130
       else if totalKm ≤ dropMaxKm:
         startCharge = rates.start
       else:
         startCharge = rates.start
         extraKm = max(totalKm - dropMaxKm, 0)
         extraCharge = extraKm × rates.extra
  
  2. Calculate hill country surcharge:
     hillCharge = isHillCountry ? (totalKm × rates.hillExtraPerKm) : 0
  
  3. Calculate base fare:
     baseFare = startCharge + extraCharge + hillCharge
  
  4. Apply day multiplier:
     finalFare = days === 1 ? baseFare : (baseFare × days)
```

### Pricing Rules Breakdown

| Rule | Condition | Pricing |
|------|-----------|---------|
| `standard_drop` | One Way, totalKm ≤ 130 | Start charge only |
| `extra_km_drop` | One Way, totalKm > 130 | Start + (extra km × rate) |
| `between_100_130` | One Way, 100-130 km | Flat between100And130 rate |
| `round_trip_up_down` | Round Trip, totalKm ≤ maxUpDownKm | Up/down charge |
| `round_trip_extra` | Round Trip, totalKm > maxUpDownKm | Up/down + extra km charge |

### Example Request

```bash
curl -X POST http://localhost:8000/api/estimate-lorry-fare \
  -H "Content-Type: application/json" \
  -d '{
    "lorryType": "7ft",
    "lorryRates": {
      "type": "7 FT",
      "hillExtraPerKm": 10,
      "start": 2500,
      "extra": 160,
      "upDown": 120,
      "between100And130": 2500,
      "maxUpDownKm": 150,
      "dropMaxKm": 130
    },
    "tripDetails": {
      "tripType": "One Way",
      "days": 1
    },
    "route": {
      "distanceKm": 95.5,
      "isHillCountry": false
    }
  }'
```

---

## 3. Error Responses

### Invalid Request
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Missing required field: route.distanceKm",
    "details": {
      "missingFields": ["route.distanceKm"]
    }
  }
}
```

### Vehicle Not Found
```json
{
  "success": false,
  "error": {
    "code": "VEHICLE_NOT_FOUND",
    "message": "Vehicle 'Toyota Vios' not found in catalog",
    "estimationType": "passenger"
  }
}
```

### Invalid Distance
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DISTANCE",
    "message": "Distance must be greater than 0",
    "receivedValue": -5
  }
}
```

---

## 4. Constants Reference

```javascript
const INCLUDED_KM_PER_DAY = 150;  // Included km per day in package pricing

const LORRY_DEFAULTS = {
  maxUpDownKm: 150,
  dropMinKm: 100,
  dropMaxKm: 130,
  hillExtraPerKm: 10
};

const FARE_CURRENCY = "LKR";  // Sri Lankan Rupees
```

---

## 5. Integration Examples

### Python Example
```python
import requests
import json

url = "http://localhost:8000/api/estimate-passenger-fare"

payload = {
    "vehicle": {
        "name": "Toyota Hiace",
        "seats": 14,
        "acPricePerKm": 180,
        "acHillPricePerKm": 220,
        "package1Prices": {
            "day1": {
                "acNormal": 15000,
                "acHill": 18000
            }
        }
    },
    "tripDetails": {
        "tripType": "One Way",
        "days": 1,
        "acOption": "AC"
    },
    "route": {
        "distanceKm": 85.5,
        "isHillCountry": True
    }
}

response = requests.post(url, json=payload)
estimate = response.json()
print(f"Estimated Fare: Rs. {estimate['data']['estimatedFare']}")
```

### JavaScript Example
```javascript
async function getPassengerEstimate(vehicleData, tripDetails, route) {
  const response = await fetch('http://localhost:8000/api/estimate-passenger-fare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vehicle: vehicleData,
      tripDetails: tripDetails,
      route: route
    })
  });
  
  const result = await response.json();
  return result.data.estimatedFare;
}
```

---

## 6. Notes for Chatbot Implementation

1. **Always validate distance**: Ensure distanceKm > 0
2. **Hill country detection**: Use GPS coordinates if available, or ask user if unsure
3. **Package recommendation**: For 1-day trips, always recommend package1 (daily package)
4. **Hill surcharge**: Applied automatically when either pickup or destination is in hill country
5. **Multi-day trips**: Price per day follows the pattern in vehicle.package1Prices
6. **Lorry round trips**: Apply rates carefully - check both up/down and extra km rules
7. **Fallback rates**: Always have default lorry rates if not fetched from database
8. **Currency**: All amounts in LKR (Sri Lankan Rupees)
9. **Rounding**: Display with 0 decimal places for final fare

---

## 7. Chatbot Response Examples

### For Passenger Vehicle
```
User: "I need to go from Colombo to Nuwara Eliya with 8 passengers"

Bot: "Great! I can help you with that. Let me find the best option for 8 passengers.

For a Toyota Hiace (AC):
📍 Distance: ~180 km
👥 Passengers: 8
🚗 Vehicle: Hiace (14 seater)
💺 AC: Available
📅 Duration: 1 day
💰 Estimated Fare: Rs. 27,600

This includes the daily package (150 km) + extra 30 km at Rs. 220/km.
Would you like to book this?"
```

### For Lorry Service
```
User: "I need to transport goods from Colombo to Galle"

Bot: "Perfect! Let me calculate the lorry rates.

For a 7 FT Lorry:
📍 Distance: ~120 km  
🚚 Lorry Type: 7 FT
📦 Loading: One Way
💰 Estimated Fare: Rs. 5,600

Breakdown:
• Start Charge: Rs. 2,500
• Extra KM (0 km): Rs. 0
• Hill Surcharge: Rs. 0
💳 Total: Rs. 5,600

Ready to proceed?"
```

