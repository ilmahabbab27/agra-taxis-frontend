# Chatbot - Package Pricing Response Format

Updated API responses with Package 1 and Package 2 pricing options.

---

## API Response: /api/bot/calculate (Updated)

### Request
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

### Response (Success - With Packages)
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

---

## Chatbot Display Logic

### When Days = 1 (Show Both Packages)

```
✅ YOUR ESTIMATE

🚐 Vehicle: Toyota Hiace (AC)
👥 Passengers: 5
📍 Pickup: Colombo
🏁 Destination: Kandy
📏 Distance: 115 km
⏱️ Trip Type: One Way

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 PACKAGE 1: Day Package (Recommended ⭐)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base Charge: Rs. 15,000
├─ Includes first 150 km
├─ Your distance: 115 km
└─ Extra km needed: 0

💰 TOTAL: Rs. 15,000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 PACKAGE 2: Per KM Pricing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Distance: 115 km × Rs. 180/km
(Hill Country Rate: Rs. 180/km)

💰 TOTAL: Rs. 20,700

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ SAVE Rs. 5,700 with Package 1!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ready to book with Package 1?
(WhatsApp/Call/Email)
```

---

### When Days = 1 (Extra Distance)

If distance > 150 km:

```
📦 PACKAGE 1: Day Package (Recommended ⭐)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base Charge: Rs. 15,000
├─ Includes first 150 km
├─ Your distance: 200 km
├─ Extra km: 50 km
└─ Extra charge: 50 × Rs. 180 = Rs. 9,000

💰 TOTAL: Rs. 24,000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 PACKAGE 2: Per KM Pricing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Distance: 200 km × Rs. 180/km

💰 TOTAL: Rs. 36,000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ SAVE Rs. 12,000 with Package 1!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### When Days = 2 (Multi-Day)

```
📦 PACKAGE 1: Day Package
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base Charge: Rs. 28,000 (2 days)
├─ Day 1: Rs. 14,000
├─ Day 2: Rs. 14,000
├─ Includes 300 km total (150 × 2)
├─ Your distance: 115 km
└─ Extra km needed: 0

💰 TOTAL: Rs. 28,000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 PACKAGE 2: Per KM Pricing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Distance: 115 km × Rs. 180/km
For 2 days: (115 × 2) × 180 = Rs. 41,400

💰 TOTAL: Rs. 41,400

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ SAVE Rs. 13,400 with Package 1!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### When Round Trip

```
📦 PACKAGE 1: Day Package
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base Charge: Rs. 15,000
├─ Includes 150 km
├─ Your total distance (round trip): 230 km
├─ Extra km: 80 km
└─ Extra charge: 80 × Rs. 180 = Rs. 14,400

💰 TOTAL: Rs. 29,400

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 PACKAGE 2: Per KM Pricing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Distance: 230 km × Rs. 180/km

💰 TOTAL: Rs. 41,400

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ SAVE Rs. 12,000 with Package 1!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## JavaScript Chatbot Implementation

```javascript
function displayPackagePricing(data) {
  const { package1, package2, days } = data.data;

  const savings = Math.max(0, package2.total - package1.total);
  const recommended = savings > 0 ? 'package1' : 'package2';

  let message = `✅ YOUR ESTIMATE\n\n`;
  message += `Distance: ${data.data.effectiveDistance} km\n`;
  message += `Days: ${days}\n\n`;

  // Package 1
  message += `📦 PACKAGE 1: ${package1.name}\n`;
  message += `Base Charge: Rs. ${formatCurrency(package1.baseCharge)}\n`;
  message += `├─ Included: ${package1.includedKm} km\n`;
  message += `├─ Extra: ${package1.additionalKm} km\n`;
  message += `└─ Extra Charge: Rs. ${formatCurrency(package1.additionalCharges)}\n`;
  message += `💰 TOTAL: Rs. ${formatCurrency(package1.total)}\n\n`;

  // Package 2
  message += `📦 PACKAGE 2: ${package2.name}\n`;
  message += `Distance: ${package2.totalKm} km × Rs. ${package2.pricePerKm}/km\n`;
  message += `💰 TOTAL: Rs. ${formatCurrency(package2.total)}\n\n`;

  // Savings
  if (savings > 0) {
    message += `✨ SAVE Rs. ${formatCurrency(savings)} with Package 1!\n\n`;
  }

  // Recommendation
  message += `⭐ RECOMMENDED: ${recommended === 'package1' ? 'Package 1' : 'Package 2'}\n`;

  return message;
}

function formatCurrency(num) {
  return new Intl.NumberFormat('en-US').format(num);
}
```

---

## Python Chatbot Implementation

```python
def display_package_pricing(data):
    package1 = data['data']['package1']
    package2 = data['data']['package2']
    days = data['data']['days']
    
    savings = max(0, package2['total'] - package1['total'])
    
    message = "✅ YOUR ESTIMATE\n\n"
    message += f"Distance: {data['data']['effectiveDistance']} km\n"
    message += f"Days: {days}\n\n"
    
    # Package 1
    message += f"📦 PACKAGE 1: {package1['name']}\n"
    message += f"Base Charge: Rs. {package1['baseCharge']:,}\n"
    message += f"├─ Included: {package1['includedKm']} km\n"
    message += f"├─ Extra: {package1['additionalKm']} km\n"
    message += f"└─ Extra Charge: Rs. {package1['additionalCharges']:,}\n"
    message += f"💰 TOTAL: Rs. {package1['total']:,}\n\n"
    
    # Package 2
    message += f"📦 PACKAGE 2: {package2['name']}\n"
    message += f"Distance: {package2['totalKm']} km × Rs. {package2['pricePerKm']}/km\n"
    message += f"💰 TOTAL: Rs. {package2['total']:,}\n\n"
    
    # Savings
    if savings > 0:
        message += f"✨ SAVE Rs. {savings:,} with Package 1!\n\n"
    
    return message
```

---

## API Data Structure

### Vehicle.package1Prices Structure

```json
{
  "day1": {
    "acNormal": 15000,
    "acHill": 18000,
    "nonAcNormal": 12000,
    "nonAcHill": 14000
  },
  "day2": {
    "acNormal": 28000,
    "acHill": 33600,
    "nonAcNormal": 24000,
    "nonAcHill": 28000
  },
  "day3": {
    "acNormal": 40000,
    "acHill": 48000,
    "nonAcNormal": 36000,
    "nonAcHill": 42000
  }
}
```

Each day level includes pricing for:
- AC Normal (flat areas)
- AC Hill (hill country)
- Non-AC Normal (flat areas)
- Non-AC Hill (hill country)

---

## When Package 1 is Better

Package 1 (Day Package) is better when:
- ✅ Distance ≤ 150 km (for 1 day)
- ✅ Customer staying for multiple days
- ✅ Distance < (150 × days) km
- ❌ Save money compared to per-km pricing

### Example: When to use Package 1

```
1 Day, 115 km distance
- Package 1: Rs. 15,000
- Package 2: Rs. 20,700
- SAVE Rs. 5,700 ✅

2 Days, 200 km total distance
- Package 1: Rs. 28,000
- Package 2: Rs. 36,000
- SAVE Rs. 8,000 ✅

1 Day, 300 km distance
- Package 1: Rs. 15,000 + (150 × Rs. 180) = Rs. 42,000
- Package 2: Rs. 54,000
- SAVE Rs. 12,000 ✅
```

---

## When Package 2 is Better

Package 2 (Per-KM) is better when:
- ❌ Short distance (< 83 km for 1 day)
- ❌ Exceeds included km significantly
- Example: 50 km on Package 1 = Rs. 15,000, but Per-KM = Rs. 9,000

---

## Database Query for Vehicle Pricing

```sql
SELECT 
  id,
  name,
  seats,
  ac_price_per_km,
  non_ac_price_per_km,
  ac_hill_price_per_km,
  non_ac_hill_price_per_km,
  package1_prices  -- JSON column with day1, day2, day3, etc.
FROM vehicles
WHERE category = 'Passenger'
```

Sample package1_prices JSON:
```json
{
  "day1": {"acNormal": 15000, "acHill": 18000, "nonAcNormal": 12000, "nonAcHill": 14000},
  "day2": {"acNormal": 28000, "acHill": 33600, "nonAcNormal": 24000, "nonAcHill": 28000}
}
```

---

## Key Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| INCLUDED_KM_PER_DAY | km included in package | 150 |
| days | number of days | 1, 2, 3 |
| tripType | One Way or Round Trip | One Way |
| pricePerKm | per km rate | 180 |
| baseCharge | package fixed charge | 15000 |
| additionalKm | km beyond included | 50 |

---

**Both Package 1 and Package 2 pricing now displayed in chatbot!** ✅
