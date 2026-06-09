# Stops Guide - Intermediate Stops/Waypoints

How to handle stops in the middle of a route.

---

## What Are Stops?

```
Pickup: Colombo
├─ Stop 1: Negombo
├─ Stop 2: Chilaw
└─ Destination: Kurunegala

Total Route: Colombo → Negombo → Chilaw → Kurunegala
```

---

## Updated Booking Flow with Stops

```
STEP 0: Service Type
STEP 1: Trip Type
STEP 2: Passenger Count
STEP 3: Select Vehicle
STEP 4: AC Option
STEP 5: Pickup Location
STEP 6: Destination Location
STEP 7: Add Stops (Optional) ← NEW
         ├─ Add Stop 1
         ├─ Add Stop 2
         ├─ Add Stop 3 (unlimited)
         └─ Remove Stops
STEP 8: Trip Details
STEP 9: Review
STEP 10: Calculate
```

---

## Complete BookingForm with Stops

```typescript
import { useState } from "react";
import { Plus, X } from "lucide-react";

export function BookingForm() {
  const [form, setForm] = useState({
    serviceType: "Passenger",
    tripType: "One Way",
    passengers: "1",
    vehicle: "",
    ac: "AC",
    pickup: "",
    destination: "",
    stops: [],  // NEW - array of stops
    date: "",
    days: "1",
  });

  const [step, setStep] = useState(0);

  const stepTitles = [
    "Service Type",
    "Trip Type",
    "Passenger Count",
    "Select Vehicle",
    "AC Option",
    "Pickup Location",
    "Destination",
    "Stops (Optional)",  // NEW
    "Trip Details",
    "Review",
    "Estimate"
  ];

  // Add a new stop
  function addStop() {
    setForm(prev => ({
      ...prev,
      stops: [
        ...prev.stops,
        { location: "", label: "" }
      ]
    }));
  }

  // Update stop location
  function updateStop(index: number, location: string, label: string) {
    setForm(prev => ({
      ...prev,
      stops: prev.stops.map((stop, i) =>
        i === index ? { location, label } : stop
      )
    }));
  }

  // Remove stop
  function removeStop(index: number) {
    setForm(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index)
    }));
  }

  // Validate stop location
  async function validateStopLocation(input: string, stopIndex: number) {
    if (!input.trim()) return null;

    try {
      const response = await fetch('/api/bot/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: input })
      });

      const result = await response.json();
      
      if (result.success) {
        updateStop(stopIndex, result.corrected, result.corrected);
        return result;
      } else {
        // Show suggestions...
        return null;
      }
    } catch (error) {
      console.error('Stop validation failed:', error);
      return null;
    }
  }

  // ... existing code ...

  return (
    <section id="booking">
      {/* ... header ... */}

      {/* STEP 7: Stops (Optional) */}
      {step === 7 && (
        <motion.div key="step-7">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-4">
              🛑 Add Intermediate Stops (Optional)
            </h3>
            
            {form.stops.length === 0 ? (
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-white/60 mb-3">
                  No stops added yet. Your vehicle will go directly from{" "}
                  <span className="font-semibold">{form.pickup}</span> to{" "}
                  <span className="font-semibold">{form.destination}</span>
                </p>
                <button
                  type="button"
                  onClick={addStop}
                  className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gold/30"
                >
                  <Plus className="h-4 w-4" />
                  Add a Stop
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Show route summary */}
                <RouteSummary
                  pickup={form.pickup}
                  stops={form.stops}
                  destination={form.destination}
                />

                {/* Stop inputs */}
                {form.stops.map((stop, index) => (
                  <div key={index} className="relative">
                    <label className="block mb-2">
                      <span className="text-xs font-semibold uppercase text-white/40">
                        Stop {index + 1}
                      </span>
                      <div className="flex gap-2 mt-1">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="Enter stop location"
                            value={stop.location}
                            onChange={(e) => {
                              updateStop(index, e.target.value, e.target.value);
                            }}
                            onBlur={(e) => {
                              if (e.target.value) {
                                validateStopLocation(e.target.value, index);
                              }
                            }}
                            className="w-full px-4 py-2 bg-white border rounded-lg text-charcoal text-sm outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeStop(index)}
                          className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </label>
                  </div>
                ))}

                {/* Add another stop button */}
                {form.stops.length < 5 && (
                  <button
                    type="button"
                    onClick={addStop}
                    className="w-full py-2 border border-dashed border-white/30 text-white/60 rounded-lg hover:border-white/50 hover:text-white/80 text-sm font-medium transition"
                  >
                    <Plus className="h-4 w-4 inline mr-2" />
                    Add Another Stop
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Info about stops */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-300">
              💡 <span className="font-semibold">About Stops:</span> The distance will be calculated 
              including all stops. You can add up to 5 stops. Each stop adds time to your journey.
            </p>
          </div>
        </motion.div>
      )}

      {/* ... rest of form ... */}
    </section>
  );
}

// Helper component to show route
function RouteSummary({ pickup, stops, destination }) {
  return (
    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-gold"></div>
          {stops.map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-0.5 h-6 bg-white/30"></div>
              <div className="h-4 w-4 rounded-full bg-yellow-400"></div>
            </div>
          ))}
          <div className="w-0.5 h-6 bg-white/30"></div>
          <div className="h-4 w-4 rounded-full bg-red-400"></div>
        </div>

        <div className="flex-1 text-sm">
          <p className="font-semibold text-white">{pickup}</p>
          {stops.map((stop, index) => (
            <div key={index} className="mt-3">
              <p className="text-white/80">
                Stop {index + 1}: <span className="font-semibold">{stop.location || "Not set"}</span>
              </p>
            </div>
          ))}
          <div className="mt-3">
            <p className="font-semibold text-white">{destination}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Distance Calculation with Stops

### Without Stops
```
Pickup: Colombo
Destination: Kandy
Distance: 115 km
```

### With Stops
```
Pickup: Colombo
Stop 1: Negombo (42 km from Colombo)
Stop 2: Chilaw (40 km from Negombo)
Destination: Kurunegala (74 km from Chilaw)

Total Distance: 42 + 40 + 74 = 156 km

Fare = 156 km × Rs. 180/km = Rs. 28,080
```

---

## API Change for Stops

### Request to /bot/calculate

```json
{
  "serviceType": "Passenger",
  "pickup": "Colombo",
  "destination": "Kurunegala",
  "stops": [
    "Negombo",
    "Chilaw"
  ],
  "vehicle": "Toyota Hiace",
  "passengers": 5,
  "acOption": "AC",
  "days": 1,
  "tripType": "One Way"
}
```

### Backend Should Calculate
```
Total Distance = Distance(Colombo→Negombo) 
               + Distance(Negombo→Chilaw)
               + Distance(Chilaw→Kurunegala)

Then apply pricing to total distance
```

---

## Stops Limitations

✅ **Allow:**
- 1-5 stops per trip
- Same location multiple times (emergency scenarios)
- Any location in the country
- Stops for One Way AND Round Trip

❌ **Prevent:**
- Duplicate consecutive stops
- Stop = Pickup location
- Stop = Destination location
- More than 5 stops

```typescript
function validateStops(stops, pickup, destination) {
  // Check for duplicate consecutive stops
  for (let i = 0; i < stops.length - 1; i++) {
    if (stops[i].location === stops[i + 1].location) {
      return { valid: false, error: "Duplicate consecutive stops" };
    }
  }

  // Check stop = pickup
  if (stops.some(s => s.location === pickup)) {
    return { valid: false, error: "Stop cannot be same as pickup" };
  }

  // Check stop = destination
  if (stops.some(s => s.location === destination)) {
    return { valid: false, error: "Stop cannot be same as destination" };
  }

  // Check max 5 stops
  if (stops.length > 5) {
    return { valid: false, error: "Maximum 5 stops allowed" };
  }

  return { valid: true };
}
```

---

## Customer Display

### Confirmation Message

```
🛤️ YOUR COMPLETE ROUTE

📍 PICKUP
   Colombo

🛑 STOP 1
   Negombo (42 km from Pickup)

🛑 STOP 2
   Chilaw (40 km from Stop 1)

📍 DESTINATION
   Kurunegala (74 km from Stop 2)

━━━━━━━━━━━━━━━━━━━━━━━━
📏 Total Distance: 156 km
💰 Estimated Fare: Rs. 28,080
⏱️ Estimated Duration: 3 hours
```

---

## Pricing Examples

### Example 1: No Stops
```
Pickup: Colombo
Destination: Kandy
Distance: 115 km
Fare: 115 × 180 = Rs. 20,700
```

### Example 2: 1 Stop
```
Pickup: Colombo
Stop 1: Kurunegala (92 km)
Destination: Kandy (92 km)

Total Distance: 92 + 92 = 184 km
Fare: 184 × 180 = Rs. 33,120
```

### Example 3: 2 Stops
```
Pickup: Colombo
Stop 1: Negombo (42 km)
Stop 2: Kurunegala (92 km)
Destination: Kandy (92 km)

Total Distance: 42 + 92 + 92 = 226 km
Fare: 226 × 180 = Rs. 40,680
```

---

## Round Trip with Stops

```
Trip Type: Round Trip
Pickup: Colombo
Stop 1: Negombo
Stop 2: Chilaw
Destination: Kurunegala

OUTBOUND: Colombo → Negombo → Chilaw → Kurunegala (156 km)
RETURN: Kurunegala → Chilaw → Negombo → Colombo (156 km)

TOTAL: 312 km
FARE: 312 × 180 = Rs. 56,160
```

---

## Step Order (Final with Stops)

```
Step 0: Service Type
Step 1: Trip Type
Step 2: Passenger Count
Step 3: Select Vehicle
Step 4: AC Option
Step 5: Pickup Location
Step 6: Destination Location
Step 7: Add Stops (Optional) ← NEW
Step 8: Trip Details
Step 9: Review
Step 10: Calculate
```

---

## Testing Stops

### Test 1: No Stops
```
Pickup: Colombo
Destination: Kandy
Expected: 115 km direct
```

### Test 2: 1 Stop
```
Pickup: Colombo
Stop 1: Kurunegala
Destination: Kandy
Expected: 92 + 92 = 184 km
```

### Test 3: 2 Stops with Round Trip
```
Trip Type: Round Trip
Pickup: Colombo
Stop 1: Negombo
Stop 2: Chilaw
Destination: Kurunegala
Expected: 156 km × 2 = 312 km total
```

---

## Best Practices

✅ Show route visually (pickup → stops → destination)
✅ Display distance for each leg
✅ Validate no duplicate consecutive stops
✅ Prevent stop = pickup or destination
✅ Limit to 5 stops maximum
✅ Calculate total distance including all legs
✅ Display total distance in confirmation
✅ Warn about increased journey time

**Stops/Waypoints complete!** ✓

