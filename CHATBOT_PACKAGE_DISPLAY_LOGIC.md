# Chatbot Package Display Logic

**Show both Package 1 & Package 2 ONLY when:**
- Days = 1 (single day trip)
- AND Distance < 150 km

---

## Display Rules

### ✅ SHOW BOTH PACKAGES

**Condition:** `days === 1 AND distance < 150`

Examples:
- 1 day, 50 km → Show Package 1 + Package 2
- 1 day, 100 km → Show Package 1 + Package 2
- 1 day, 149 km → Show Package 1 + Package 2

```
📦 PACKAGE 1: Day Package (Recommended)
Base Charge: Rs. 15,000
├─ Includes first 150 km
├─ Your distance: 100 km
└─ Extra km needed: 0
💰 TOTAL: Rs. 15,000

📦 PACKAGE 2: Per KM Pricing
Distance: 100 km × Rs. 180/km
💰 TOTAL: Rs. 18,000

✨ SAVE Rs. 3,000 with Package 1!
```

---

### ❌ SHOW ONLY PACKAGE 2

**Condition:** `days === 1 AND distance >= 150`

Examples:
- 1 day, 150 km → Show ONLY Package 2
- 1 day, 200 km → Show ONLY Package 2
- 1 day, 300 km → Show ONLY Package 2

```
💰 FARE ESTIMATE

Distance: 200 km × Rs. 180/km
(Hill Country Rate: Rs. 220/km if applicable)

TOTAL: Rs. 36,000

Note: You can also choose a day package with 
additional km charges if you prefer.
```

---

### ❌ SHOW ONLY PACKAGE 2

**Condition:** `days > 1` (any distance)

Examples:
- 2 days, 100 km → Show ONLY Package 2
- 2 days, 200 km → Show ONLY Package 2
- 3 days, 100 km → Show ONLY Package 2

```
💰 FARE ESTIMATE (Multi-Day Trip)

Distance per day: 100 km
Total trip duration: 2 days
Price: 100 km × Rs. 180/km × 2 days = Rs. 36,000

TOTAL: Rs. 36,000
```

---

## Decision Tree

```
START: User enters all details
  │
  ├─ Days = 1?
  │   │
  │   ├─ YES
  │   │   │
  │   │   └─ Distance < 150 km?
  │   │       │
  │   │       ├─ YES → SHOW BOTH PACKAGES ✅
  │   │       │        (Package 1 + Package 2)
  │   │       │
  │   │       └─ NO → SHOW PACKAGE 2 ONLY ❌
  │   │               (Distance >= 150 km)
  │   │
  │   └─ NO → SHOW PACKAGE 2 ONLY ❌
  │           (Multi-day trip)
  │
  END: Display appropriate option(s)
```

---

## JavaScript Implementation

```javascript
function displayFareEstimate(data) {
  const { days, effectiveDistance } = data.data;
  const { package1, package2 } = data.data;

  // Show both packages ONLY if: days === 1 AND distance < 150
  const showBothPackages = days === 1 && effectiveDistance < 150;

  let message = `✅ YOUR ESTIMATE\n\n`;
  message += `Distance: ${effectiveDistance} km\n`;
  message += `Days: ${days}\n\n`;

  if (showBothPackages) {
    // SHOW BOTH PACKAGES
    const savings = package2.total - package1.total;

    message += `📦 PACKAGE 1: ${package1.name}\n`;
    message += `Base Charge: Rs. ${formatCurrency(package1.baseCharge)}\n`;
    message += `├─ Includes first 150 km\n`;
    message += `├─ Your distance: ${effectiveDistance} km\n`;
    message += `└─ Extra km needed: 0\n`;
    message += `💰 TOTAL: Rs. ${formatCurrency(package1.total)}\n\n`;

    message += `📦 PACKAGE 2: ${package2.name}\n`;
    message += `Distance: ${effectiveDistance} km × Rs. ${package2.pricePerKm}/km\n`;
    message += `💰 TOTAL: Rs. ${formatCurrency(package2.total)}\n\n`;

    message += `✨ SAVE Rs. ${formatCurrency(savings)} with Package 1!\n`;

  } else {
    // SHOW ONLY PACKAGE 2

    if (days === 1) {
      // Single day but >= 150 km
      message += `📦 FARE ESTIMATE\n\n`;
      message += `Distance: ${effectiveDistance} km × Rs. ${package2.pricePerKm}/km\n`;
      message += `💰 TOTAL: Rs. ${formatCurrency(package2.total)}\n\n`;
      message += `Note: Distance exceeds the 150 km included in day packages.\n`;

    } else {
      // Multi-day trip
      message += `📦 FARE ESTIMATE (${days}-Day Trip)\n\n`;
      message += `Distance per day: ${Math.round(effectiveDistance / days)} km\n`;
      message += `Total distance: ${effectiveDistance} km\n`;
      message += `Rate: Rs. ${package2.pricePerKm}/km\n`;
      message += `Duration: ${days} days\n\n`;
      message += `💰 TOTAL: Rs. ${formatCurrency(package2.total)}\n`;
    }
  }

  return message;
}
```

---

## Python Implementation

```python
def display_fare_estimate(data):
    days = data['data']['days']
    effective_distance = data['data']['effectiveDistance']
    package1 = data['data']['package1']
    package2 = data['data']['package2']

    # Show both packages ONLY if: days === 1 AND distance < 150
    show_both_packages = (days == 1 and effective_distance < 150)

    message = f"✅ YOUR ESTIMATE\n\n"
    message += f"Distance: {effective_distance} km\n"
    message += f"Days: {days}\n\n"

    if show_both_packages:
        # SHOW BOTH PACKAGES
        savings = package2['total'] - package1['total']

        message += f"📦 PACKAGE 1: {package1['name']}\n"
        message += f"Base Charge: Rs. {package1['baseCharge']:,}\n"
        message += f"├─ Includes first 150 km\n"
        message += f"├─ Your distance: {effective_distance} km\n"
        message += f"└─ Extra km needed: 0\n"
        message += f"💰 TOTAL: Rs. {package1['total']:,}\n\n"

        message += f"📦 PACKAGE 2: {package2['name']}\n"
        message += f"Distance: {effective_distance} km × Rs. {package2['pricePerKm']}/km\n"
        message += f"💰 TOTAL: Rs. {package2['total']:,}\n\n"

        message += f"✨ SAVE Rs. {savings:,} with Package 1!\n"

    else:
        # SHOW ONLY PACKAGE 2

        if days == 1:
            # Single day but >= 150 km
            message += f"📦 FARE ESTIMATE\n\n"
            message += f"Distance: {effective_distance} km × Rs. {package2['pricePerKm']}/km\n"
            message += f"💰 TOTAL: Rs. {package2['total']:,}\n\n"
            message += f"Note: Distance exceeds the 150 km included in day packages.\n"

        else:
            # Multi-day trip
            message += f"📦 FARE ESTIMATE ({days}-Day Trip)\n\n"
            message += f"Distance per day: {round(effective_distance / days)} km\n"
            message += f"Total distance: {effective_distance} km\n"
            message += f"Rate: Rs. {package2['pricePerKm']}/km\n"
            message += f"Duration: {days} days\n\n"
            message += f"💰 TOTAL: Rs. {package2['total']:,}\n"

    return message
```

---

## Chatbot Display Examples

### Example 1: 1 Day, 80 km (SHOW BOTH)
```
✅ YOUR ESTIMATE

Distance: 80 km
Days: 1

📦 PACKAGE 1: Day Package (Recommended ⭐)
Base Charge: Rs. 15,000
├─ Includes first 150 km
├─ Your distance: 80 km
└─ Extra km needed: 0
💰 TOTAL: Rs. 15,000

📦 PACKAGE 2: Per KM Pricing
Distance: 80 km × Rs. 180/km
💰 TOTAL: Rs. 14,400

✨ SAVE Rs. 600 with Package 1!
```

---

### Example 2: 1 Day, 180 km (SHOW ONLY PACKAGE 2)
```
✅ YOUR ESTIMATE

Distance: 180 km
Days: 1

📦 FARE ESTIMATE
Distance: 180 km × Rs. 180/km
💰 TOTAL: Rs. 32,400

Note: Distance exceeds the 150 km included in day packages.
```

---

### Example 3: 2 Days, 80 km (SHOW ONLY PACKAGE 2)
```
✅ YOUR ESTIMATE (2-Day Trip)

Distance per day: 40 km
Total distance: 80 km
Rate: Rs. 180/km
Duration: 2 days

💰 TOTAL: Rs. 14,400
```

---

### Example 4: 1 Day, 149 km (SHOW BOTH)
```
✅ YOUR ESTIMATE

Distance: 149 km
Days: 1

📦 PACKAGE 1: Day Package (Recommended ⭐)
Base Charge: Rs. 15,000
├─ Includes first 150 km
├─ Your distance: 149 km
└─ Extra km needed: 0
💰 TOTAL: Rs. 15,000

📦 PACKAGE 2: Per KM Pricing
Distance: 149 km × Rs. 180/km
💰 TOTAL: Rs. 26,820

✨ SAVE Rs. 11,820 with Package 1!
```

---

### Example 5: 1 Day, 150 km (SHOW ONLY PACKAGE 2)
```
✅ YOUR ESTIMATE

Distance: 150 km
Days: 1

📦 FARE ESTIMATE
Distance: 150 km × Rs. 180/km
💰 TOTAL: Rs. 27,000

Note: Distance exceeds the 150 km included in day packages.
```

---

## Backend Service Logic (PHP)

```php
public function estimatePassengerFare($vehicle, $options, $distance)
{
    $days = isset($options['days']) ? intval($options['days']) : 1;
    $distanceKm = $distance['distanceKm'];

    // DECIDE: Show both packages or only package 2?
    $showBothPackages = ($days === 1 && $distanceKm < 150);

    if ($showBothPackages) {
        // Calculate BOTH Package 1 and Package 2
        $package1 = $this->calculatePackage1($vehicle, $options, $distance);
        $package2 = $this->calculatePackage2($pricePerKm, $distanceKm, $isHillCountry);

        return [
            'success' => true,
            'data' => [
                'package1' => $package1,
                'package2' => $package2,
                'recommended' => 'package1',
                'showBothPackages' => true
            ]
        ];
    } else {
        // Calculate ONLY Package 2
        $package2 = $this->calculatePackage2($pricePerKm, $distanceKm, $isHillCountry);

        return [
            'success' => true,
            'data' => [
                'package2' => $package2,
                'showBothPackages' => false,
                'reason' => ($days > 1) ? 'multi_day' : 'exceeds_150km'
            ]
        ];
    }
}
```

---

## Summary

| Scenario | Show Both? | Display |
|----------|-----------|---------|
| 1 day, 50 km | ✅ YES | Package 1 + Package 2 |
| 1 day, 100 km | ✅ YES | Package 1 + Package 2 |
| 1 day, 149 km | ✅ YES | Package 1 + Package 2 |
| 1 day, 150 km | ❌ NO | Package 2 only |
| 1 day, 200 km | ❌ NO | Package 2 only |
| 2 days, 100 km | ❌ NO | Package 2 only |
| 3 days, 50 km | ❌ NO | Package 2 only |

**Rule:** `showBothPackages = (days === 1 && distance < 150)`

---

**Simple and clear!** ✅
