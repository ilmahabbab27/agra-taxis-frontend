# Agra Connect - Chatbot Integration Quick Start

## Quick Reference for Chatbot Developers

### Two Main Endpoints

#### 1. Passenger Vehicle Fare Estimation
```
POST /api/estimate-passenger-fare
```

**Minimal Request:**
```json
{
  "vehicle": {
    "name": "Toyota Hiace",
    "acPricePerKm": 180,
    "nonAcPricePerKm": 150,
    "acHillPricePerKm": 220,
    "nonAcHillPricePerKm": 180,
    "package1Prices": {
      "day1": { "acNormal": 15000, "acHill": 18000 }
    }
  },
  "tripDetails": {
    "tripType": "One Way",
    "days": 1,
    "acOption": "AC"
  },
  "route": {
    "distanceKm": 85.5,
    "isHillCountry": false
  }
}
```

**Response:**
```json
{
  "estimatedFare": 15370,
  "breakdown": {
    "package1": { "estimate": 15370 },
    "package2": { "estimate": 15399 }
  }
}
```

---

#### 2. Lorry Service Fare Estimation
```
POST /api/estimate-lorry-fare
```

**Minimal Request:**
```json
{
  "lorryRates": {
    "type": "7 FT",
    "start": 2500,
    "extra": 160,
    "upDown": 120,
    "between100And130": 2500,
    "maxUpDownKm": 150,
    "dropMaxKm": 130,
    "hillExtraPerKm": 10
  },
  "tripDetails": {
    "tripType": "One Way",
    "days": 1
  },
  "route": {
    "distanceKm": 95.5,
    "isHillCountry": false
  }
}
```

**Response:**
```json
{
  "estimatedFare": 2500,
  "breakdown": {
    "startCharge": 2500,
    "extraKmCharge": 0,
    "hillSurcharge": 0
  }
}
```

---

## Chatbot Decision Tree

```
User says they need transport
    │
    ├─→ Ask: "Do you need to move passengers or cargo?"
    │
    ├─→ PASSENGERS
    │   ├─→ Ask: "How many passengers?"
    │   ├─→ Ask: "Where from and where to?" (Get distance)
    │   ├─→ Ask: "Do you prefer AC or Non AC?"
    │   ├─→ Check: Is destination in hill country?
    │   └─→ Call: /api/estimate-passenger-fare
    │
    └─→ CARGO/LORRY
        ├─→ Ask: "What size lorry?" (7ft, 8.5ft, 10.5ft, etc.)
        ├─→ Ask: "Where from and where to?" (Get distance)
        ├─→ Ask: "One way or round trip?"
        └─→ Call: /api/estimate-lorry-fare
```

---

## Key Calculation Formulas

### Passenger Vehicle

```
INCLUDED_KM_PER_DAY = 150

includedKm = days × 150
additionalKm = max(0, totalKm - includedKm)

if hillCountry:
    pricePerKm = acHillPricePerKm (if AC) or nonAcHillPricePerKm
else:
    pricePerKm = acPricePerKm (if AC) or nonAcPricePerKm

package1 = packageCharge + (additionalKm × pricePerKm)
package2 = totalKm × pricePerKm
recommendation = min(package1, package2)
```

### Lorry Service

```
For ONE WAY trips:
    if 100 ≤ km ≤ 130:
        fare = between100And130Charge
    else if km ≤ dropMaxKm (130):
        fare = startCharge
    else:
        fare = startCharge + ((km - dropMaxKm) × extraRate)

For ROUND TRIP:
    if km ≤ maxUpDownKm (150):
        fare = upDownCharge
    else:
        fare = upDownCharge + ((km - maxUpDownKm) × extraRate)

if hillCountry:
    hillSurcharge = km × hillExtraPerKm (10)
    fare += hillSurcharge
```

---

## Sample Chatbot Conversations

### Scenario 1: Passenger - Colombo to Kandy (AC)

```
Bot: "Hi! How can I help you with transportation?"
User: "I want to go from Colombo to Kandy with 8 friends"

Bot: "That sounds like a group trip! I'll need a few details:
1. How many passengers in total?"
User: "8 people including me, so 9"

Bot: "Great! Do you prefer AC or Non AC?"
User: "AC please"

Bot: "Calculating... The distance from Colombo to Kandy is about 115 km.
📍 From: Colombo (Normal)
📍 To: Kandy (Hill Country)
👥 Passengers: 9
💺 Vehicle: Toyota Hiace (14 seater)
🌡️ AC: Yes
📏 Distance: 115 km

💰 BEST PRICE: Rs. 18,000 (Package 1 - Daily rate)
   - Daily package: Rs. 15,000 (150 km included)
   - Extra 0 km: Rs. 0

Alternative (Package 2): Rs. 20,700 (Pure distance-based)

Would you like to book this?"
```

### Scenario 2: Lorry - Colombo to Matara (One Way)

```
Bot: "Hi! What kind of cargo transport do you need?"
User: "I need to move furniture from Colombo to Matara"

Bot: "I can help! What size lorry would you need?
- 7 FT (Smallest)
- 8.5 FT
- 10.5 FT (Large)
- 12.5 FT (Extra Large)"
User: "7 FT should be enough"

Bot: "Distance from Colombo to Matara is about 42 km.
🚚 Lorry: 7 FT
📦 Service: One Way
📍 Distance: 42 km
☀️ Area: Normal (No hill surcharge)

💰 ESTIMATED FARE: Rs. 2,500
   Breakdown:
   ✓ Start Charge: Rs. 2,500
   ✓ Extra KM: 0 (Distance within 130 km)
   ✓ Hill Surcharge: None

Ready to proceed with booking?"
```

### Scenario 3: Lorry - Round Trip in Hill Country

```
Bot: "What kind of delivery do you need?"
User: "I need to transport goods from Kandy to Nuwara Eliya and back"

Bot: "That's a round trip in hill country. 
Let me check what we have...

📏 Distance: ~70 km (one way)
🚚 Lorry: 7 FT
📦 Service: Round Trip
⛰️  Area: Hill Country (Extra charge applies)

💰 ESTIMATED FARE: Rs. 3,200
   Breakdown:
   ✓ Up & Down Charge: Rs. 1,200
   ✓ Extra KM: 0 (Within max up/down: 150 km)
   ✓ Hill Surcharge: Rs. 2,000 (70 km × Rs. 10/km × 2 for round trip)

Total for round trip with return: Rs. 3,200

Would you like to book?"
```

---

## Integration Checklist

- [ ] Add two endpoints to chatbot API routes
- [ ] Implement FareEstimationService in Laravel backend
- [ ] Add validation for distance, days, AC option
- [ ] Store vehicle catalog and lorry rates in database
- [ ] Implement hill country detection (if not done already)
- [ ] Add error handling for invalid inputs
- [ ] Create response formatters for chatbot display
- [ ] Test with sample distances and vehicle types
- [ ] Add logging for all fare estimation requests
- [ ] Set up monitoring for calculation accuracy
- [ ] Document rate changes procedure
- [ ] Create admin panel for rate updates

---

## Common Chatbot Questions to Handle

### Q: "Why is the price different from the website?"
**A:** The website calculates based on real-time GPS distance, while the chatbot uses approximate distances. For exact pricing, please use the website booking form.

### Q: "Can I get a discount for multiple bookings?"
**A:** The prices shown are our standard rates. Please contact our office for bulk booking discounts.

### Q: "What's included in the package?"
**Passenger:** The daily package includes 150 km of travel. Extra distance is charged at the per-km rate.
**Lorry:** The quoted price includes the starting charge and distance calculations as shown.

### Q: "How is hill country surcharge calculated?"
**A:** If your pickup or destination is in the hill country (like Kandy, Nuwara Eliya, Badulla), an extra surcharge applies per kilometer for safer mountain travel.

### Q: "What if the actual distance is different?"
**A:** The final fare will be based on actual distance traveled. The estimate is for planning purposes.

---

## API Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `INVALID_REQUEST` | Missing required fields | Ask user for missing information |
| `VEHICLE_NOT_FOUND` | Vehicle not in catalog | Suggest alternative vehicles |
| `INVALID_DISTANCE` | Distance <= 0 | Ask user to provide valid distance |
| `ESTIMATION_ERROR` | Server error | "I couldn't calculate the fare. Please try the website." |

---

## Rate Update Procedure

When rates change in the backend:

1. Admin updates rates in database
2. Frontend/chatbot fetches latest vehicle catalog
3. All new estimates use updated rates
4. No code changes required

**To update rates:**
```sql
UPDATE vehicles SET ac_price_per_km = 180 WHERE name = 'Toyota Hiace';
UPDATE lorry_rates SET start = 2500 WHERE type = '7 FT';
```

---

## Performance Tips

1. **Cache vehicle catalog** - Refresh every 1 hour
2. **Cache lorry rates** - Refresh every 1 hour  
3. **Pre-fetch common routes** - Store distance estimates for popular routes
4. **Batch requests** - If calculating multiple routes, do them in parallel
5. **Log all estimates** - For analytics and debugging

---

## Testing

### Test Cases for Passenger Vehicle

| Scenario | Distance | Days | AC | Hill | Expected |
|----------|----------|------|----|----|----------|
| Local trip | 50 km | 1 | Yes | No | ~10,000 |
| Medium trip | 150 km | 1 | Yes | No | ~15,000 |
| Hill country | 85 km | 1 | Yes | Yes | ~18,700 |
| Multi-day | 300 km | 2 | No | No | ~44,000 |

### Test Cases for Lorry

| Scenario | Distance | Type | Round Trip | Hill | Expected |
|----------|----------|------|------------|------|----------|
| Short | 50 km | 7FT | No | No | 2,500 |
| Medium | 95 km | 7FT | No | No | 2,500 |
| Long | 150 km | 7FT | No | No | 6,400 |
| Round trip | 70 km | 7FT | Yes | Yes | 3,200 |

---

## Support & Debugging

If estimates seem incorrect:

1. **Check distance** - Verify GPS distance is accurate
2. **Check rates** - Confirm latest rates in database
3. **Check hill country** - Verify classification is correct
4. **Check vehicle selection** - Confirm correct vehicle rates loaded
5. **Review calculation** - Trace through formula manually
6. **Check logs** - Review estimation service logs for errors

---

## Next Steps

1. Copy the **FARE_ESTIMATION_SERVICE.php** to your Laravel project
2. Review **CHATBOT_API_SPEC.md** for full details
3. Implement the two API endpoints
4. Test with sample data
5. Integrate with your chatbot platform
6. Monitor for accuracy

Questions? Refer to the full API specification or contact the development team.
