# Trip Type Guide - One Way vs Round Trip

How to handle trip type selection in booking form.

---

## Where to Place Trip Type

### Option 1: EARLY (Step 1) - Recommended
```
Step 0: Service Type (Passenger/Lorry)
Step 1: Trip Type (One Way / Round Trip) ← EARLY
Step 2: Passenger Count
Step 3: Select Vehicle
...
```

**Advantages:**
- Determines flow early
- Affects pricing calculation
- Clear intent from start

### Option 2: STEP 6 (With Other Details)
```
Step 0-5: Collect all details
Step 6: Trip Details (Type + Date + Days)
Step 7: Review
Step 8: Calculate
```

**Advantages:**
- With related info
- Less intrusive
- Customer knows vehicle first

---

## Recommended: Early Selection

I recommend **Step 1** (right after service type) because:

✅ Trip type affects pricing
✅ Determines which locations to ask for
✅ Affects date/days requirements
✅ Clear booking intent

---

## Updated Flow with Trip Type Early

```
STEP 0: Service Type
    ↓
STEP 1: Trip Type (ONE WAY / ROUND TRIP) ← HERE
    ↓
STEP 2: Passenger Count
    ↓
STEP 3: Select Vehicle
    ↓
STEP 4: AC Option
    ↓
STEP 5: Pickup Location
    ↓
STEP 6: Destination Location
    ├─ If Round Trip:
    │  Show: "Return to {pickup} ?"
    │  Pickup = Destination
    │  Destination = Pickup
    ↓
STEP 7: Trip Details (Date, Days)
    ↓
STEP 8: Review
    ↓
STEP 9: Calculate
```

---

## One Way vs Round Trip

### One Way
```
Pickup: Colombo
Destination: Kandy
Distance: 115 km

Price = 115 km × Rs. 180/km
      = Rs. 20,700 (for AC)
```

### Round Trip
```
Pickup: Colombo
Destination: Kandy
Return: Kandy → Colombo

Total Distance: 115 × 2 = 230 km

Price = 230 km × Rs. 180/km
      = Rs. 41,400 (for AC)

OR

Lorry Round Trip Rate Applied
```

---

## Updated BookingForm - With Trip Type Early

```typescript
import { useState } from "react";

export function BookingForm() {
  const [form, setForm] = useState({
    serviceType: "Passenger",
    tripType: "One Way",  // NEW - at top level
    passengers: "1",
    vehicle: "",
    ac: "AC",
    pickup: "",
    destination: "",
    date: "",
    days: "1",
  });

  const [step, setStep] = useState(0);

  // Updated step titles
  const stepTitles = [
    "Service Type",
    "Trip Type",           // NEW - Step 1
    "Passenger Count",     // Step 2
    "Select Vehicle",      // Step 3
    "AC Option",           // Step 4
    "Pickup Location",     // Step 5
    "Destination",         // Step 6
    "Trip Details",        // Step 7
    "Review",              // Step 8
    "Estimate"             // Step 9
  ];

  // ... rest of code ...

  return (
    <section id="booking">
      {/* ... header ... */}

      {/* STEP 1: Trip Type */}
      {step === 1 && (
        <motion.div key="step-1">
          <label className="block">
            <span className="mb-4 block text-xs font-semibold uppercase tracking-wider text-white/40">
              Trip Type
            </span>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* One Way Button */}
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, tripType: "One Way" }))}
                className={`p-6 rounded-lg border text-left transition ${
                  form.tripType === "One Way"
                    ? "border-gold bg-white/10 text-white"
                    : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
                }`}
              >
                <p className="text-2xl mb-2">🛣️</p>
                <p className="text-sm font-semibold">One Way</p>
                <p className="mt-1 text-xs text-white/45">
                  Pickup → Destination
                </p>
                <p className="text-xs text-yellow-300 mt-2">
                  Single trip fare
                </p>
              </button>

              {/* Round Trip Button */}
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, tripType: "Round Trip" }))}
                className={`p-6 rounded-lg border text-left transition ${
                  form.tripType === "Round Trip"
                    ? "border-gold bg-white/10 text-white"
                    : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
                }`}
              >
                <p className="text-2xl mb-2">🔄</p>
                <p className="text-sm font-semibold">Round Trip</p>
                <p className="mt-1 text-xs text-white/45">
                  Pickup → Destination → Pickup
                </p>
                <p className="text-xs text-green-300 mt-2">
                  Double trip fare
                </p>
              </button>
            </div>
          </label>

          {/* Show what round trip means */}
          {form.tripType === "Round Trip" && (
            <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-300">
                💡 You'll travel to the destination and return to the pickup location. 
                Total distance will be calculated for both legs.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* STEP 6: Destination (Show different message for round trip) */}
      {step === 6 && (
        <motion.div key="step-6">
          <LocationInput
            label={form.tripType === "Round Trip" ? "Destination (will return here)" : "Destination Location"}
            placeholder={
              form.tripType === "Round Trip"
                ? "Where to? (You'll return to " + form.pickup + ")"
                : "Where to?"
            }
            value={form.destination}
            // ... rest of props ...
          />

          {form.tripType === "Round Trip" && pickupLocation && (
            <div className="mt-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-sm text-purple-300">
                📍 Return Route:
              </p>
              <p className="text-xs text-purple-300 mt-2">
                {destinationLocation?.location} → {pickupLocation.location}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}
```

---

## API Changes for Round Trip

### Request to /bot/calculate

**One Way:**
```json
{
  "serviceType": "Passenger",
  "pickup": "Colombo",
  "destination": "Kandy",
  "tripType": "One Way",
  "distance": 115
}
```

**Round Trip:**
```json
{
  "serviceType": "Passenger",
  "pickup": "Colombo",
  "destination": "Kandy",
  "tripType": "Round Trip",
  "distance": 230  // 115 × 2
}
```

### Response Examples

**One Way (115 km):**
```json
{
  "estimatedFare": 20700,
  "distance": 115,
  "breakdown": {
    "package1": 20700,
    "package2": 20700
  }
}
```

**Round Trip (230 km):**
```json
{
  "estimatedFare": 41400,
  "distance": 230,
  "breakdown": {
    "package1": 41400,
    "package2": 41400
  }
}
```

---

## Passenger Count Impact on Trip Type

### For One Way (Passenger)
```
Passengers: 5
Trip: One Way
Distance: 115 km

One vehicle needed
Same vehicle returns empty
```

### For Round Trip (Passenger)
```
Passengers: 5
Trip: Round Trip
Distance: 115 km × 2 = 230 km

Same vehicle used for both legs
Customer pays for full round trip distance
```

---

## Date/Days for Different Trip Types

### One Way
```
Optional Date (single trip)
Days: Always 1 (single day trip)
Don't ask for return date
```

### Round Trip
```
Optional Departure Date
Optional Return Date
Days: Could be multi-day round trip
Example: 
  - Colombo to Kandy: 2 days
  - Stay in Kandy: 2 days
  - Return to Colombo: 1 day
  Total: 5 days
```

---

## Updated Step Details

### Step 7: Trip Details (Different for One Way vs Round Trip)

**One Way:**
```typescript
{step === 7 && (
  <div className="grid gap-5 sm:grid-cols-2">
    <DateInput label="Departure Date (Optional)" />
    <TimeInput label="Departure Time (Optional)" />
  </div>
)}
```

**Round Trip:**
```typescript
{step === 7 && form.tripType === "Round Trip" && (
  <div className="grid gap-5 sm:grid-cols-2">
    <DateInput label="Departure Date (Optional)" />
    <DateInput label="Return Date (Optional)" />
    <TimeInput label="Departure Time" />
    <TimeInput label="Return Time" />
    <input type="number" label="Days (Optional)" />
  </div>
)}
```

---

## Pricing Formula

### One Way
```
fare = distance_km × price_per_km
```

### Round Trip
```
fare = (distance_km × 2) × price_per_km
```

### With Hill Country Surcharge
```
One Way:
fare = distance_km × (price_per_km + 10)

Round Trip:
fare = (distance_km × 2) × (price_per_km + 10)
```

---

## Customer Messages

### One Way Confirmation
```
✓ Colombo → Kandy
📏 Distance: 115 km
💰 Fare: Rs. 20,700
```

### Round Trip Confirmation
```
✓ Colombo → Kandy → Colombo
📏 Total Distance: 230 km (115 km each way)
💰 Fare: Rs. 41,400
```

---

## Complete Step Order (Final)

```
STEP 0: Service Type (Passenger/Lorry)
STEP 1: Trip Type (One Way / Round Trip) ← NEW
STEP 2: Passenger Count
STEP 3: Select Vehicle
STEP 4: AC Option
STEP 5: Pickup Location
STEP 6: Destination (shows "Return to pickup" for round trip)
STEP 7: Trip Details (Date/Days - different for round trip)
STEP 8: Review All
STEP 9: Calculate Fare
```

---

## Testing Trip Types

### Test 1: One Way
```
Trip Type: One Way
Pickup: Colombo
Destination: Kandy (115 km)
Expected Fare: Rs. 20,700 (115 × 180)
```

### Test 2: Round Trip
```
Trip Type: Round Trip
Pickup: Colombo
Destination: Kandy (115 km each way = 230 km total)
Expected Fare: Rs. 41,400 (230 × 180)
```

### Test 3: Round Trip with Hill Country
```
Trip Type: Round Trip
Pickup: Colombo (normal)
Destination: Kandy (hill country)
Distance: 230 km
Rate: 190/km (180 + 10 hill)
Expected Fare: Rs. 43,700 (230 × 190)
```

---

## Best Practice

✅ Place trip type early (Step 1)
✅ Show clear visual difference (icons + text)
✅ Explain what each means
✅ Show return location for round trip
✅ Calculate distance × 2 for round trip
✅ Update dates/days questions based on type
✅ Display confirmation clearly

**Complete trip type implementation!** ✓

