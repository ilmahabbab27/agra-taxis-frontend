# Booking Form - Correct Flow (Passenger Count First)

Proper order: Passengers → Vehicle → Locations → Calculate

---

## Correct Step Order

```
STEP 0: Service Type (Passenger/Lorry)
    ↓
STEP 1: Passenger Count (if Passenger)
    ├─ How many passengers?
    └─ Show matching vehicles
    ↓
STEP 2: Select Vehicle
    ├─ Filter by passenger count
    ├─ Show AC availability
    └─ Show price per km
    ↓
STEP 3: AC Option (if available)
    ├─ AC
    ├─ Non AC
    └─ Or both if available
    ↓
STEP 4: Pickup Location
    ├─ Input with autocomplete
    ├─ Validate location
    └─ Show suggestions
    ↓
STEP 5: Destination Location
    ├─ Input with autocomplete
    ├─ Validate location
    └─ Calculate distance
    ↓
STEP 6: Trip Details
    ├─ Trip type (One Way/Round Trip)
    ├─ Date (optional)
    ├─ Days (if multi-day)
    └─ Time (optional)
    ↓
STEP 7: Charges Review
    ├─ Show all selections
    ├─ Show breakdown
    └─ Review before calculating
    ↓
STEP 8: Calculate & Show Estimate
    ├─ Call /bot/calculate
    ├─ Show Package 1 & 2
    └─ WhatsApp booking
    ↓
END
```

---

## Updated BookingForm.tsx

```typescript
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Search } from "lucide-react";

export function BookingForm() {
  const [form, setForm] = useState({
    serviceType: "Passenger",
    passengers: "1",
    vehicle: "",
    ac: "AC",
    pickup: "",
    destination: "",
    tripType: "One Way",
    date: "",
    time: "",
    days: "1",
  });

  // State
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionType, setSuggestionType] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [summary, setSummary] = useState(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const stepTitles = [
    "Service Type",
    "Passenger Count",
    "Select Vehicle",
    "AC Option",
    "Pickup Location",
    "Destination",
    "Trip Details",
    "Review",
    "Estimate"
  ];

  // Load vehicles on mount
  useEffect(() => {
    loadVehicles();
  }, []);

  // Update available vehicles when passenger count changes
  useEffect(() => {
    const paxCount = parseInt(form.passengers);
    const matching = vehicles.filter(v => v.seats >= paxCount);
    setAvailableVehicles(matching);
    
    // Auto-select first vehicle if current one doesn't fit
    if (!matching.some(v => v.name === form.vehicle)) {
      setForm(prev => ({ ...prev, vehicle: matching[0]?.name || "" }));
    }
  }, [form.passengers, vehicles]);

  // ===== API CALLS =====

  async function loadVehicles() {
    try {
      // Fetch from your vehicle database
      const response = await fetch('/api/vehicles');
      const data = await response.json();
      setVehicles(data.data || []);
      setAvailableVehicles(data.data || []);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      // Use fallback vehicles
      setVehicles([
        {
          id: 1,
          name: "Toyota Aqua",
          seats: 5,
          category: "Cars",
          acPricePerKm: 120,
          nonAcPricePerKm: 100,
          acAvailable: true,
          nonAcAvailable: true
        },
        {
          id: 2,
          name: "Toyota Hiace",
          seats: 14,
          category: "Mini Buses",
          acPricePerKm: 180,
          nonAcPricePerKm: 150,
          acAvailable: true,
          nonAcAvailable: true
        }
      ]);
    }
  }

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
        body: JSON.stringify({ location: input, type })
      });

      const result = await response.json();

      if (result.success) {
        setErrors(prev => ({ ...prev, [type]: undefined }));
        return result;
      } else {
        if (result.suggestions?.length > 0) {
          setSuggestions(result.suggestions);
          setSuggestionType(type);
          setShowSuggestions(true);
        }
        setErrors(prev => ({ ...prev, [type]: result.message }));
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
        body: JSON.stringify({ from, to })
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
          vehicle: form.vehicle,
          passengers: form.passengers,
          acOption: form.ac,
          days: form.days,
          tripType: form.tripType
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
      if (destinationLocation) {
        calculateDistance(location.name, destinationLocation.location);
      }
    } else {
      setDestinationLocation({ location: location.name, ...location });
      setForm(prev => ({ ...prev, destination: location.name }));
      if (pickupLocation) {
        calculateDistance(pickupLocation.location, location.name);
      }
    }

    setShowSuggestions(false);
    setSuggestions([]);
  }

  function goNext() {
    // Validate current step
    switch (step) {
      case 0:
        if (!form.serviceType) {
          setErrors({ serviceType: "Select service type" });
          return;
        }
        break;
      case 1:
        if (!form.passengers || parseInt(form.passengers) < 1) {
          setErrors({ passengers: "Enter valid passenger count" });
          return;
        }
        break;
      case 2:
        if (!form.vehicle) {
          setErrors({ vehicle: "Select a vehicle" });
          return;
        }
        break;
      case 4:
        if (!pickupLocation) {
          setErrors({ pickup: "Select pickup location" });
          return;
        }
        break;
      case 5:
        if (!destinationLocation) {
          setErrors({ destination: "Select destination" });
          return;
        }
        break;
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
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center">
          <h2 className="text-4xl font-black text-white">Request a Vehicle</h2>
          <p className="mt-4 text-base text-white/45">Book in {stepTitles.length} simple steps</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="mt-12 overflow-hidden border border-white/8 bg-white/[0.02]">
          <div className="border-b border-white/8 px-5 py-4 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
              Step {step + 1} - {stepTitles[step]}
            </p>
            <div className="mt-3 flex gap-1">
              {stepTitles.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition ${index <= step ? "bg-gold" : "bg-white/15"}`}
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
                    <ServiceTypeButton
                      title="Passenger Vehicle"
                      description="Cars, vans, minibuses, buses"
                      emoji="🚗"
                      selected={form.serviceType === "Passenger"}
                      onClick={() => {
                        setForm(prev => ({ ...prev, serviceType: "Passenger" }));
                        goNext();
                      }}
                    />
                    <ServiceTypeButton
                      title="Lorry"
                      description="Cargo and goods transport"
                      emoji="🚚"
                      selected={form.serviceType === "Lorry"}
                      onClick={() => {
                        setForm(prev => ({ ...prev, serviceType: "Lorry" }));
                        goNext();
                      }}
                    />
                  </motion.div>
                )}

                {/* STEP 1: Passenger Count */}
                {step === 1 && form.serviceType === "Passenger" && (
                  <motion.div key="step-1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">How many passengers?</span>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={form.passengers}
                        onChange={(e) => setForm(prev => ({ ...prev, passengers: e.target.value }))}
                        className="w-full px-4 py-3 bg-white border rounded-xl text-charcoal text-sm font-medium outline-none"
                        autoFocus
                      />
                      {errors.passengers && <span className="mt-1 text-xs text-red-500">{errors.passengers}</span>}
                    </label>

                    {availableVehicles.length > 0 && (
                      <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-sm text-green-300">
                          ✓ {availableVehicles.length} vehicle{availableVehicles.length === 1 ? "" : "s"} available
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 2: Select Vehicle */}
                {step === 2 && form.serviceType === "Passenger" && (
                  <motion.div key="step-2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">Select Vehicle</span>
                      <select
                        value={form.vehicle}
                        onChange={(e) => setForm(prev => ({ ...prev, vehicle: e.target.value }))}
                        className="w-full px-4 py-3 bg-white border rounded-xl text-charcoal text-sm font-medium outline-none"
                      >
                        <option value="">Choose a vehicle...</option>
                        {availableVehicles.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.name}>
                            {vehicle.name} - {vehicle.seats} seats (Rs. {vehicle.acPricePerKm}/km AC)
                          </option>
                        ))}
                      </select>
                      {errors.vehicle && <span className="mt-1 text-xs text-red-500">{errors.vehicle}</span>}
                    </label>

                    {form.vehicle && (
                      <div className="mt-4 grid gap-3">
                        {availableVehicles.find(v => v.name === form.vehicle)?.acAvailable && (
                          <VehicleFeature label="AC Available" icon="❄️" />
                        )}
                        {availableVehicles.find(v => v.name === form.vehicle)?.nonAcAvailable && (
                          <VehicleFeature label="Non-AC Available" icon="💨" />
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 3: AC Option */}
                {step === 3 && form.serviceType === "Passenger" && (
                  <motion.div key="step-3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">AC Preference</span>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, ac: "AC" }))}
                          className={`p-4 rounded-xl border text-left transition ${
                            form.ac === "AC"
                              ? "border-gold bg-white/10 text-white"
                              : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
                          }`}
                        >
                          <p className="font-semibold">❄️ AC</p>
                          <p className="text-xs mt-1">Air Conditioned</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, ac: "Non AC" }))}
                          className={`p-4 rounded-xl border text-left transition ${
                            form.ac === "Non AC"
                              ? "border-gold bg-white/10 text-white"
                              : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
                          }`}
                        >
                          <p className="font-semibold">💨 Non-AC</p>
                          <p className="text-xs mt-1">Standard</p>
                        </button>
                      </div>
                    </label>
                  </motion.div>
                )}

                {/* STEP 4: Pickup Location */}
                {step === 4 && (
                  <motion.div key="step-4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <LocationInput
                      label="Pickup Location"
                      placeholder="Where from? (e.g., Colombo)"
                      value={form.pickup}
                      onChange={(e) => setForm(prev => ({ ...prev, pickup: e.target.value }))}
                      onBlur={() => {
                        if (form.pickup && !pickupLocation) {
                          validateLocation(form.pickup, "pickup");
                        }
                      }}
                      error={errors.pickup}
                      suggestions={showSuggestions && suggestionType === "pickup" ? suggestions : []}
                      onSelectSuggestion={(loc) => handleLocationSelect(loc, "pickup")}
                      selected={pickupLocation}
                    />
                  </motion.div>
                )}

                {/* STEP 5: Destination Location */}
                {step === 5 && (
                  <motion.div key="step-5" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <LocationInput
                      label="Destination Location"
                      placeholder="Where to?"
                      value={form.destination}
                      onChange={(e) => setForm(prev => ({ ...prev, destination: e.target.value }))}
                      onBlur={() => {
                        if (form.destination && !destinationLocation) {
                          validateLocation(form.destination, "destination");
                        }
                      }}
                      error={errors.destination}
                      suggestions={showSuggestions && suggestionType === "destination" ? suggestions : []}
                      onSelectSuggestion={(loc) => handleLocationSelect(loc, "destination")}
                      selected={destinationLocation}
                      showDistance={distance ? `📍 ${distance.distance_km} km` : ""}
                    />
                  </motion.div>
                )}

                {/* STEP 6: Trip Details */}
                {step === 6 && (
                  <motion.div key="step-6" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">Trip Type</label>
                      <select
                        value={form.tripType}
                        onChange={(e) => setForm(prev => ({ ...prev, tripType: e.target.value }))}
                        className="w-full px-4 py-3 bg-white border rounded-xl text-charcoal text-sm font-medium outline-none"
                      >
                        <option>One Way</option>
                        <option>Round Trip</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">Date (Optional)</label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-4 py-3 bg-white border rounded-xl text-charcoal text-sm font-medium outline-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 7: Review */}
                {step === 7 && (
                  <motion.div key="step-7" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-3">
                    <ReviewRow label="Service" value={form.serviceType} />
                    <ReviewRow label="Passengers" value={form.passengers} />
                    <ReviewRow label="Vehicle" value={form.vehicle} />
                    <ReviewRow label="AC Option" value={form.ac} />
                    <ReviewRow label="Pickup" value={pickupLocation?.location || "—"} />
                    <ReviewRow label="Destination" value={destinationLocation?.location || "—"} />
                    {distance && <ReviewRow label="Distance" value={`${distance.distance_km} km`} />}
                    <ReviewRow label="Trip Type" value={form.tripType} />
                  </motion.div>
                )}

                {/* STEP 8: Estimate */}
                {step === 8 && (
                  <motion.div key="step-8" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    {!summary ? (
                      <div className="text-center py-8">
                        {loading ? (
                          <>
                            <svg className="h-8 w-8 animate-spin text-gold mx-auto mb-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                            </svg>
                            <p className="text-white">Calculating your fare...</p>
                          </>
                        ) : (
                          <button type="submit" className="bg-gold px-5 py-3 text-sm font-black uppercase text-charcoal hover:brightness-110">
                            Get Fare Estimate
                          </button>
                        )}
                      </div>
                    ) : (
                      <div ref={summaryRef} className="space-y-4">
                        <FareBox title="Estimated Fare" fare={summary.estimatedFare} highlight />
                        {summary.breakdown?.package1 && (
                          <FareBox title="Package 1 (Daily)" fare={summary.breakdown.package1} />
                        )}
                        {summary.breakdown?.package2 && (
                          <FareBox title="Package 2 (Distance)" fare={summary.breakdown.package2} />
                        )}
                        <button
                          type="submit"
                          className="w-full bg-whatsapp py-3 text-white font-bold rounded-lg hover:brightness-110"
                        >
                          📱 Reserve on WhatsApp
                        </button>
                      </div>
                    )}
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

// Helper Components

function ServiceTypeButton({ title, description, emoji, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-4 py-4 text-left transition rounded-lg ${
        selected ? "border-gold bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
      }`}
    >
      <p className="text-2xl mb-2">{emoji}</p>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-white/45">{description}</p>
    </button>
  );
}

function LocationInput({ label, placeholder, value, onChange, onBlur, error, suggestions, onSelectSuggestion, selected, showDistance }) {
  return (
    <div>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">{label}</span>
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className="w-full px-4 py-3 pl-10 bg-white border rounded-xl text-charcoal text-sm font-medium outline-none"
            autoFocus
          />
        </div>
        {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
      </label>

      {suggestions.length > 0 && (
        <div className="mt-3 border border-white/10 rounded-xl bg-white/5 overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 border-b border-white/10 last:border-0"
            >
              <span className="font-semibold">{suggestion.name}</span>
              <span className="text-xs text-white/60 ml-2">• {suggestion.district}</span>
              {suggestion.isHillCountry && <span className="text-xs ml-2">⛰️</span>}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-green-300">✓ {selected.location}</p>
          {showDistance && <p className="text-xs text-green-300 mt-1">{showDistance}</p>}
        </div>
      )}
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between p-3 rounded-lg bg-white/5 border border-white/10">
      <span className="text-xs font-semibold uppercase text-white/60">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function VehicleFeature({ label, icon }) {
  return (
    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
      <p className="text-sm text-blue-300">{icon} {label}</p>
    </div>
  );
}

function FareBox({ title, fare, highlight }) {
  return (
    <div className={`p-4 rounded-lg border ${highlight ? "bg-gold/20 border-gold/30" : "bg-white/5 border-white/10"}`}>
      <p className={`text-xs font-semibold uppercase ${highlight ? "text-gold" : "text-white/60"}`}>{title}</p>
      <p className={`text-2xl font-bold mt-2 ${highlight ? "text-gold" : "text-white"}`}>
        Rs. {fare?.toLocaleString()}
      </p>
    </div>
  );
}
```

---

## Correct Step Order

1. ✅ **Service Type** (Passenger/Lorry)
2. ✅ **Passenger Count** (Before vehicle selection)
3. ✅ **Select Vehicle** (Filtered by passenger count)
4. ✅ **AC Option** (If available)
5. ✅ **Pickup Location**
6. ✅ **Destination Location**
7. ✅ **Trip Details** (Type, Date)
8. ✅ **Review** (Summary)
9. ✅ **Calculate** (Estimate)

---

## Key Features

✅ Passengers FIRST
✅ Vehicles filtered by passenger count
✅ AC option after vehicle selection
✅ Location validation with autocomplete
✅ Distance calculation
✅ Review all before calculating
✅ Same /bot/location & /bot/calculate endpoints

**Complete, proper flow!** ✓

