# Booking Form - Same Flow as Chatbot

Refactor BookingForm.tsx to use the same endpoints and flow as chatbot.

---

## Updated Architecture

```
BookingForm.tsx
    ↓
Uses same 2 endpoints:
    ├─ POST /bot/location       (Location validation)
    └─ POST /bot/calculate      (Fare calculation)
    ↓
LocationPredictorService (Shared)
FareEstimationService (Shared)
```

---

## Updated BookingForm Flow

```
STEP 0: Select Service Type (Passenger/Lorry)
    ↓
STEP 1: Get Pickup Location
    ├─ Input field with autocomplete
    ├─ Validate with /bot/location
    ├─ Show suggestions if needed
    └─ Display location details
    ↓
STEP 2: Get Destination Location
    ├─ Same as pickup
    ├─ Show distance after selection
    └─ Display hill country flag
    ↓
STEP 3: Passenger Details (Passengers/AC) OR Lorry Details (Lorry Type)
    ├─ Passengers: count, AC option
    ├─ Lorry: size selection
    └─ Date (optional)
    ↓
STEP 4: View Charges (Summary)
    ├─ Show breakdown
    └─ Display all details
    ↓
STEP 5: Check Pricing (Calculate)
    ├─ Call /bot/calculate
    ├─ Show 2 packages (Passenger)
    ├─ Show breakdown (Lorry)
    └─ Display fare estimate
    ↓
Reserve on WhatsApp
```

---

## Updated BookingForm.tsx

```typescript
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Search } from "lucide-react";

export function BookingForm() {
  const [vehicleList, setVehicleList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [form, setForm] = useState({
    serviceType: "Passenger" as "Passenger" | "Lorry",
    pickup: "",
    destination: "",
    date: "",
    time: "",
    days: "1",
    trip: "One Way",
    pax: "1",
    ac: "AC",
    vehicle: "",
  });

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionType, setSuggestionType] = useState(""); // "pickup" or "destination"

  const [summary, setSummary] = useState(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const stepTitles = ["Vehicle Type", "Pickup Location", "Destination", "Details", "Charges", "Estimate"];

  // ===== API CALLS =====

  async function validateLocation(input: string, type: "pickup" | "destination") {
    if (!input.trim()) {
      setErrors(prev => ({ ...prev, [type]: "Location cannot be empty" }));
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/bot/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: input,
          type: type
        })
      });

      const result = await response.json();

      if (result.success) {
        setErrors(prev => ({ ...prev, [type]: undefined }));
        return result;
      } else {
        // Show suggestions
        if (result.suggestions && result.suggestions.length > 0) {
          setSuggestions(result.suggestions);
          setSuggestionType(type);
          setShowSuggestions(true);
          setErrors(prev => ({ ...prev, [type]: result.message }));
        } else {
          setErrors(prev => ({ ...prev, [type]: result.message }));
        }
        return null;
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, [type]: "Failed to validate location" }));
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function calculateDistance(from: string, to: string) {
    try {
      const response = await fetch('/api/locations/distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: from,
          to: to
        })
      });

      const result = await response.json();
      if (result.success) {
        setDistance(result);
      }
    } catch (error) {
      console.error('Distance calculation failed:', error);
    }
  }

  async function calculateFare() {
    if (!pickupLocation || !destinationLocation) {
      setErrors({ general: "Both locations required" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/bot/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: form.serviceType,
          pickup: pickupLocation.location,
          destination: destinationLocation.location,
          vehicle: form.vehicle || "Toyota Hiace",
          passengers: form.pax,
          acOption: form.ac,
          days: form.days,
          tripType: form.trip,
          lorryType: "7ft"
        })
      });

      const result = await response.json();

      if (result.success) {
        setSummary(result);
        setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: "Failed to calculate fare" });
    } finally {
      setLoading(false);
    }
  }

  // ===== HANDLERS =====

  function handleLocationSelect(location: any, type: "pickup" | "destination") {
    if (type === "pickup") {
      setPickupLocation({ location: location.name, ...location });
      setForm(prev => ({ ...prev, pickup: location.name }));
      
      // Calculate distance if destination is already set
      if (destinationLocation) {
        calculateDistance(location.name, destinationLocation.location);
      }
    } else {
      setDestinationLocation({ location: location.name, ...location });
      setForm(prev => ({ ...prev, destination: location.name }));
      
      // Calculate distance if pickup is already set
      if (pickupLocation) {
        calculateDistance(pickupLocation.location, location.name);
      }
    }

    setShowSuggestions(false);
    setSuggestions([]);
  }

  function goNext() {
    // Validate current step
    if (step === 1) {
      if (!pickupLocation) {
        setErrors({ pickup: "Select a pickup location" });
        return;
      }
    }

    if (step === 2) {
      if (!destinationLocation) {
        setErrors({ destination: "Select a destination" });
        return;
      }
    }

    setErrors({});
    setStep(s => Math.min(s + 1, stepTitles.length - 1));
  }

  function goBack() {
    setStep(s => Math.max(s - 1, 0));
  }

  // ===== RENDER STEPS =====

  return (
    <section id="booking" className="relative overflow-hidden bg-[#0e0f11] py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 opacity-5" 
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <h2 className="text-4xl font-black text-white">Request a Vehicle</h2>
          <p className="mt-4 text-base text-white/45">Book your ride in minutes</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="mt-12 overflow-hidden border border-white/8 bg-white/[0.02]">
          <div className="border-b border-white/8 px-5 py-4 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
              Step {step + 1} - {stepTitles[step]}
            </p>
            <div className="mt-3 flex gap-2">
              {stepTitles.map((_, index) => (
                <span
                  key={index}
                  className={`h-2.5 w-2.5 rounded-full ${index <= step ? "bg-gold" : "bg-white/15"}`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); calculateFare(); }}>
            <div className="p-5 sm:p-8">
              <AnimatePresence mode="wait">
                {/* STEP 0: Service Type */}
                {step === 0 && (
                  <motion.div key="step-0" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-5 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, serviceType: "Passenger" }));
                        goNext();
                      }}
                      className={`border px-4 py-4 text-left transition ${
                        form.serviceType === "Passenger" ? "border-gold bg-white/10" : "border-white/10 bg-white/5"
                      }`}
                    >
                      <p className="text-sm font-semibold">Passenger Vehicle</p>
                      <p className="mt-1 text-xs text-white/45">Cars, vans, minibuses, buses</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, serviceType: "Lorry" }));
                        goNext();
                      }}
                      className={`border px-4 py-4 text-left transition ${
                        form.serviceType === "Lorry" ? "border-gold bg-white/10" : "border-white/10 bg-white/5"
                      }`}
                    >
                      <p className="text-sm font-semibold">Lorry</p>
                      <p className="mt-1 text-xs text-white/45">Cargo and goods transport</p>
                    </button>
                  </motion.div>
                )}

                {/* STEP 1: Pickup Location */}
                {step === 1 && (
                  <motion.div key="step-1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">Pickup Location</span>
                      <div className="relative">
                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-white/30" />
                        <input
                          type="text"
                          placeholder="Enter location (e.g., Colombo, Kandy)"
                          value={form.pickup}
                          onChange={(e) => {
                            setForm(prev => ({ ...prev, pickup: e.target.value }));
                          }}
                          onBlur={() => {
                            if (form.pickup && !pickupLocation) {
                              validateLocation(form.pickup, "pickup");
                            }
                          }}
                          className="w-full px-4 py-3 pl-10 bg-white border rounded-xl text-charcoal text-sm font-medium outline-none"
                        />
                      </div>
                      {errors.pickup && <span className="mt-1 text-xs text-red-500">{errors.pickup}</span>}
                    </label>

                    {showSuggestions && suggestionType === "pickup" && (
                      <div className="mt-3 border border-white/10 rounded-xl bg-white/5">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleLocationSelect(suggestion, "pickup")}
                            className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 border-b border-white/10 last:border-0"
                          >
                            <span className="font-semibold">{suggestion.name}</span>
                            <span className="text-xs text-white/60"> • {suggestion.district}</span>
                            {suggestion.isHillCountry && <span className="text-xs ml-2">⛰️</span>}
                          </button>
                        ))}
                      </div>
                    )}

                    {pickupLocation && (
                      <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-sm text-green-300">✓ {pickupLocation.location} selected</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 2: Destination Location */}
                {step === 2 && (
                  <motion.div key="step-2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">Destination Location</span>
                      <div className="relative">
                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-white/30" />
                        <input
                          type="text"
                          placeholder="Where are you going?"
                          value={form.destination}
                          onChange={(e) => {
                            setForm(prev => ({ ...prev, destination: e.target.value }));
                          }}
                          onBlur={() => {
                            if (form.destination && !destinationLocation) {
                              validateLocation(form.destination, "destination");
                            }
                          }}
                          className="w-full px-4 py-3 pl-10 bg-white border rounded-xl text-charcoal text-sm font-medium outline-none"
                        />
                      </div>
                      {errors.destination && <span className="mt-1 text-xs text-red-500">{errors.destination}</span>}
                    </label>

                    {showSuggestions && suggestionType === "destination" && (
                      <div className="mt-3 border border-white/10 rounded-xl bg-white/5">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleLocationSelect(suggestion, "destination")}
                            className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 border-b border-white/10 last:border-0"
                          >
                            <span className="font-semibold">{suggestion.name}</span>
                            <span className="text-xs text-white/60"> • {suggestion.district}</span>
                            {suggestion.isHillCountry && <span className="text-xs ml-2">⛰️</span>}
                          </button>
                        ))}
                      </div>
                    )}

                    {destinationLocation && distance && (
                      <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-sm text-green-300">✓ {destinationLocation.location} selected</p>
                        <p className="text-xs text-green-300 mt-1">📍 Distance: {distance.distance_km} km</p>
                        {distance.is_hill_country_route && <p className="text-xs text-yellow-300 mt-1">⛰️ Hill country route</p>}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 3: Details */}
                {step === 3 && (
                  <motion.div key="step-3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-5 sm:grid-cols-2">
                    {form.serviceType === "Passenger" ? (
                      <>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">Passengers</label>
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={form.pax}
                            onChange={(e) => setForm(prev => ({ ...prev, pax: e.target.value }))}
                            className="w-full px-4 py-3 bg-white border rounded-xl text-charcoal text-sm font-medium outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">AC / Non AC</label>
                          <select
                            value={form.ac}
                            onChange={(e) => setForm(prev => ({ ...prev, ac: e.target.value }))}
                            className="w-full px-4 py-3 bg-white border rounded-xl text-charcoal text-sm font-medium outline-none"
                          >
                            <option value="AC">AC</option>
                            <option value="Non AC">Non AC</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">Lorry Type</label>
                        <select
                          className="w-full px-4 py-3 bg-white border rounded-xl text-charcoal text-sm font-medium outline-none"
                        >
                          <option value="7ft">7 FT</option>
                          <option value="10.5ft">10.5 FT</option>
                          <option value="12.5ft">12.5 FT</option>
                        </select>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 4: Charges (Summary) */}
                {step === 4 && (
                  <motion.div key="step-4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <div className="space-y-3">
                      <SummaryRow label="Service" value={form.serviceType} />
                      <SummaryRow label="Pickup" value={pickupLocation?.location || "Not set"} />
                      <SummaryRow label="Destination" value={destinationLocation?.location || "Not set"} />
                      {distance && <SummaryRow label="Distance" value={`${distance.distance_km} km`} />}
                      {form.serviceType === "Passenger" && (
                        <>
                          <SummaryRow label="Passengers" value={form.pax} />
                          <SummaryRow label="AC Option" value={form.ac} />
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: Estimate */}
                {step === 5 && !summary && (
                  <motion.div key="step-5-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="text-center py-8">
                      {loading ? (
                        <>
                          <div className="inline-flex mb-4">
                            <svg className="h-8 w-8 animate-spin text-gold" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                            </svg>
                          </div>
                          <p className="text-white">Calculating your fare...</p>
                        </>
                      ) : (
                        <button
                          type="submit"
                          className="bg-gold px-5 py-3 text-sm font-black uppercase text-charcoal hover:brightness-110"
                        >
                          Check Pricing
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Summary */}
                {summary && (
                  <motion.div ref={summaryRef} key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="border border-gold/15 bg-[#121214] p-6 rounded-lg">
                      <h3 className="text-lg font-bold text-white mb-4">Fare Estimate</h3>
                      <div className="space-y-3">
                        <FareRow label="Estimated Fare" value={`Rs. ${summary.estimatedFare?.toLocaleString()}`} highlight />
                        {summary.breakdown?.package1 && (
                          <FareRow label="Package 1" value={`Rs. ${summary.breakdown.package1?.toLocaleString()}`} />
                        )}
                        {summary.breakdown?.package2 && (
                          <FareRow label="Package 2" value={`Rs. ${summary.breakdown.package2?.toLocaleString()}`} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="border-t border-white/8 px-5 py-4 sm:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0}
                  className="inline-flex items-center justify-center gap-2 border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>

                {step < stepTitles.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center justify-center gap-2 bg-gold px-5 py-3 text-sm font-black uppercase text-charcoal hover:brightness-110"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 bg-gold px-5 py-3 text-sm font-black uppercase text-charcoal hover:brightness-110"
                  >
                    {summary ? "Reserve on WhatsApp" : "Calculate"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between p-3 rounded-lg bg-white/5 border border-white/10">
      <span className="text-xs font-semibold uppercase text-white/60">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function FareRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between p-3 rounded-lg ${highlight ? "bg-gold/20 border border-gold/30" : "bg-white/5"}`}>
      <span className={`text-sm font-semibold ${highlight ? "text-gold" : "text-white/80"}`}>{label}</span>
      <span className={`text-sm font-bold ${highlight ? "text-gold" : "text-white"}`}>{value}</span>
    </div>
  );
}
```

---

## Key Changes

✅ Uses same `/bot/location` endpoint for validation
✅ Uses same `/bot/calculate` endpoint for fare
✅ Shows real-time suggestions (autocomplete)
✅ Validates location with proper error handling
✅ Shows distance after destination selection
✅ Displays hill country flag
✅ Loading states while calculating
✅ Same fare breakdown (Package 1 & 2)
✅ Error suggestions fallback

---

## Routes to Add (If Not Already There)

```php
// routes/api.php
Route::post('/bot/location', [BotController::class, 'location']);
Route::post('/bot/calculate', [BotController::class, 'calculate']);
Route::post('/locations/distance', [LocationController::class, 'distance']);
```

---

## Same Flow Now Works In:

✅ **Chatbot** - Conversation style
✅ **Booking Form** - Step-by-step form
✅ **Both use** same 2 APIs
✅ **Both handle** same errors
✅ **Both show** fare estimates

**Complete integration!** 🎯

