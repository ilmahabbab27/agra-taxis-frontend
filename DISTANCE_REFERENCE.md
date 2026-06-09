# Distance Reference - Sri Lanka Locations

Accurate distances calculated using Haversine formula (coordinates-based).

---

## From Colombo to Major Destinations

| Destination | Distance (km) | Hill Country | Travel Time |
|-------------|---------------|--------------|-------------|
| Negombo | 42 | No | 1 hour |
| Chilaw | 82 | No | 1.5 hours |
| Kurunegala | 92 | No | 2 hours |
| Ratnapura | 105 | Yes | 2.5 hours |
| Kandy | 115 | Yes | 2.5 hours |
| Matale | 128 | Yes | 3 hours |
| Dambulla | 148 | Yes | 3.5 hours |
| Nuwara Eliya | 180 | Yes | 4 hours |
| Badulla | 225 | Yes | 5 hours |
| Galle | 119 | No | 2.5 hours |
| Matara | 160 | No | 3.5 hours |
| Trincomalee | 257 | No | 5.5 hours |
| Batticaloa | 355 | No | 7+ hours |
| Jaffna | 401 | No | 8+ hours |

---

## Hill Country Locations (Hill Surcharge Applies)

These locations automatically get +Rs. 10/km surcharge:
- **Kandy** - 115 km from Colombo ⛰️
- **Nuwara Eliya** - 180 km from Colombo ⛰️
- **Matale** - 128 km from Colombo ⛰️
- **Dambulla** - 148 km from Colombo ⛰️
- **Badulla** - 225 km from Colombo ⛰️
- **Ratnapura** - 105 km from Colombo ⛰️

---

## Lowland Locations (No Surcharge)

- **Negombo** - 42 km
- **Chilaw** - 82 km
- **Kurunegala** - 92 km
- **Galle** - 119 km
- **Matara** - 160 km
- **Trincomalee** - 257 km
- **Batticaloa** - 355 km
- **Jaffna** - 401 km

---

## Distance Calculation Formula

The system uses **Haversine formula** for accurate great-circle distance:

```
R = 6371 km (Earth's radius)
Δφ = lat2 - lat1
Δλ = lon2 - lon1
a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
c = 2 × atan2(√a, √(1-a))
d = R × c
```

This calculates the shortest distance between two GPS coordinates.

---

## Test Distances

### Test Case 1: Colombo to Kandy
- **Expected:** ~115 km
- **Hill Country:** Yes
- **Price per km (AC):** Rs. 180 + Rs. 10 (hill) = Rs. 190/km

### Test Case 2: Colombo to Galle
- **Expected:** ~119 km
- **Hill Country:** No
- **Price per km (AC):** Rs. 180/km

### Test Case 3: Colombo to Nuwara Eliya
- **Expected:** ~180 km
- **Hill Country:** Yes
- **Price per km (AC):** Rs. 180 + Rs. 10 (hill) = Rs. 190/km

### Test Case 4: Kandy to Nuwara Eliya
- **Expected:** ~65 km
- **Hill Country:** Yes (both in hill country)
- **Price per km (AC):** Rs. 180 + Rs. 10 (hill) = Rs. 190/km

---

## How Distance Affects Pricing

### Passenger Vehicle Example (5 passengers, AC, 1 day)

**Colombo → Kandy (115 km, Hill Country)**
```
Distance: 115 km
Daily Package: 150 km included
Extra km: 0 (within 150 km)
Base rate: Rs. 180/km
Hill surcharge: Rs. 10/km
Effective rate: Rs. 190/km

Package 1 (Daily): Rs. 15,000 (includes 150 km)
Package 2 (Distance): 115 km × Rs. 190 = Rs. 21,850
✓ Recommended: Package 1 (Rs. 15,000)
```

**Colombo → Nuwara Eliya (180 km, Hill Country)**
```
Distance: 180 km
Daily Package: 150 km included
Extra km: 30 km (beyond 150 km)
Base rate: Rs. 180/km
Hill surcharge: Rs. 10/km
Effective rate: Rs. 190/km

Package 1 (Daily): Rs. 15,000 + (30 km × Rs. 190) = Rs. 20,700
Package 2 (Distance): 180 km × Rs. 190 = Rs. 34,200
✓ Recommended: Package 1 (Rs. 20,700)
```

---

## Lorry Pricing Distance Impact

### 7 FT Lorry

**Colombo → Matara (160 km, No Hill)**
```
Distance: 160 km
Rule: Drop (>130 km, one-way)
Start charge: Rs. 2,500
Extra km: 160 - 130 = 30 km
Extra charge: 30 km × Rs. 160/km = Rs. 4,800
Hill surcharge: Rs. 0 (not hill country)

Total: Rs. 2,500 + Rs. 4,800 = Rs. 7,300
```

**Kandy → Nuwara Eliya (65 km, Hill Country)**
```
Distance: 65 km
Rule: Standard (≤130 km, one-way)
Start charge: Rs. 2,500
Extra km: 0 (within 130 km)
Hill surcharge: 65 km × Rs. 10/km = Rs. 650

Total: Rs. 2,500 + Rs. 0 + Rs. 650 = Rs. 3,150
```

---

## Validation Checklist

When distance is calculated, verify:

- ✅ Both locations are valid and recognized
- ✅ Distance is positive (> 0 km)
- ✅ Hill country flag is set correctly
- ✅ Distance matches expected range
- ✅ Surcharge is applied if in hill country
- ✅ Fare calculation uses correct distance

---

## Debugging Distance Issues

### Distance seems wrong?

1. **Check location spelling:**
   ```
   curl -X POST /bot/location
   {"location": "kandy"}
   ```
   Verify the corrected location name

2. **Verify coordinates:**
   ```
   Response includes:
   "coordinates": {"lat": 6.9271, "lng": 80.6306}
   ```
   Check if latitude and longitude look correct

3. **Test distance endpoint:**
   ```
   POST /locations/distance
   {"from": "Colombo", "to": "Kandy"}
   
   Should return: ~115 km
   ```

4. **Check hill country detection:**
   ```
   POST /locations/is-hill-country
   {"location": "Kandy"}
   
   Should return: isHillCountry = true
   ```

---

## Integration Note

The `/bot/calculate` endpoint automatically:
1. ✅ Validates both locations
2. ✅ Calculates accurate distance using coordinates
3. ✅ Detects if any location is in hill country
4. ✅ Applies surcharge if needed
5. ✅ Returns breakdown with correct fare

**You don't need to calculate distance manually** - just send location names and the API handles it.

