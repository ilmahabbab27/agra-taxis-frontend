# Smart Sequential Booking Flow

Progressive filtering and LLM-powered location prediction.

---

## Complete Smart Flow

```
STEP 1: Passenger Count
  └─ "How many passengers?" (1-60)
      ↓
STEP 2: Vehicle Selection (FILTERED)
  └─ Show only vehicles that fit passenger count
      ↓
STEP 3: AC/Non-AC (CONDITIONAL)
  └─ Show only if vehicle offers both options
      ↓
STEP 4: Trip Type
  └─ "One Way" or "Round Trip"
      ↓
STEP 5: Date & Time (OPTIONAL)
  └─ When traveling? (date + time)
      ↓
STEP 6: Pickup Location (LLM-PREDICTED)
  └─ "Where from?"
      ├─ LLM suggests best matches
      ├─ Map-based prediction
      └─ User confirms or types
      ↓
STEP 7: Drop Location (LLM-PREDICTED)
  └─ "Where to?"
      ├─ LLM suggests based on pickup
      ├─ Map-based route prediction
      └─ User confirms or types
      ↓
STEP 8: Distance Calculation
  ├─ Haversine distance calculation
  ├─ Update amount per km (based on vehicle)
  ├─ Show: "{distance} km × Rs.{rate}/km"
  └─ Display real-time as user selects locations
      ↓
STEP 9: Display Estimation
  ├─ Passenger Count
  ├─ Vehicle Name
  ├─ AC Option
  ├─ Distance
  ├─ Rate per km
  ├─ Total Fare
  ├─ Trip Type
  ├─ Date & Time
  └─ "Book Now" button
      ↓
FINAL: WhatsApp Booking
  └─ Send details to WhatsApp
```

---

## Step-by-Step Implementation

### STEP 1: Passenger Count

```typescript
function Step1PassengerCount() {
  const [passengers, setPassengers] = useState("1");

  return (
    <div>
      <h2>👥 How many passengers?</h2>
      <input
        type="number"
        min={1}
        max={60}
        value={passengers}
        onChange={(e) => setPassengers(e.target.value)}
        className="px-4 py-3 rounded-lg"
      />
      <button 
        onClick={() => proceedToStep2(passengers)}
        className="mt-4 bg-gold px-5 py-3"
      >
        Next: Select Vehicle
      </button>
    </div>
  );
}
```

### STEP 2: Vehicle Selection (FILTERED by Passenger Count)

```typescript
function Step2VehicleSelection({ passengers }) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Fetch from database and filter
  useEffect(() => {
    fetch('/api/vehicles')
      .then(r => r.json())
      .then(data => {
        // FILTER: Only show vehicles that fit passenger count
        const matching = data.filter(v => v.seats >= passengers);
        setVehicles(matching);
      });
  }, [passengers]);

  return (
    <div>
      <h2>🚗 Vehicles for {passengers} passengers</h2>
      <div className="grid gap-3">
        {vehicles.map(vehicle => (
          <button
            key={vehicle.id}
            onClick={() => setSelectedVehicle(vehicle)}
            className={`p-4 rounded-lg border ${
              selectedVehicle?.id === vehicle.id ? "border-gold bg-gold/10" : ""
            }`}
          >
            <p className="font-semibold">{vehicle.name}</p>
            <p className="text-xs text-white/60">
              {vehicle.seats} seats • 
              Rs. {vehicle.acPricePerKm}/km (AC) • 
              Rs. {vehicle.nonAcPricePerKm}/km (Non-AC)
            </p>
          </button>
        ))}
      </div>
      <button onClick={() => proceedToStep3(selectedVehicle)}>
        Next: AC/Non-AC
      </button>
    </div>
  );
}
```

### STEP 3: AC/Non-AC (CONDITIONAL - Only if vehicle offers both)

```typescript
function Step3AcOption({ vehicle }) {
  const [acOption, setAcOption] = useState("AC");

  // Check what options vehicle offers
  const hasAC = vehicle.acAvailable;
  const hasNonAC = vehicle.nonAcAvailable;

  // Skip this step if only one option
  if ((hasAC && !hasNonAC) || (!hasAC && hasNonAC)) {
    return (
      <AutoSkipToNextStep 
        acOption={hasAC ? "AC" : "Non AC"}
        message={`Only ${hasAC ? "AC" : "Non-AC"} available for this vehicle`}
      />
    );
  }

  return (
    <div>
      <h2>🌡️ AC or Non-AC?</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {hasAC && (
          <button
            onClick={() => setAcOption("AC")}
            className={acOption === "AC" ? "selected" : ""}
          >
            <p>❄️ AC</p>
            <p>Rs. {vehicle.acPricePerKm}/km</p>
          </button>
        )}
        {hasNonAC && (
          <button
            onClick={() => setAcOption("Non AC")}
            className={acOption === "Non AC" ? "selected" : ""}
          >
            <p>💨 Non-AC</p>
            <p>Rs. {vehicle.nonAcPricePerKm}/km</p>
          </button>
        )}
      </div>
      <button onClick={() => proceedToStep4(acOption)}>
        Next: Trip Type
      </button>
    </div>
  );
}
```

### STEP 4: Trip Type (One Way or Round Trip)

```typescript
function Step4TripType() {
  const [tripType, setTripType] = useState("One Way");

  return (
    <div>
      <h2>🛣️ Trip Type</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => setTripType("One Way")}
          className={tripType === "One Way" ? "selected" : ""}
        >
          <p>🛣️ One Way</p>
          <p className="text-xs">Pickup → Destination</p>
        </button>
        <button
          onClick={() => setTripType("Round Trip")}
          className={tripType === "Round Trip" ? "selected" : ""}
        >
          <p>🔄 Round Trip</p>
          <p className="text-xs">Pickup → Destination → Pickup</p>
        </button>
      </div>
      <button onClick={() => proceedToStep5(tripType)}>
        Next: Date & Time
      </button>
    </div>
  );
}
```

### STEP 5: Date & Time (OPTIONAL)

```typescript
function Step5DateTime() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  return (
    <div>
      <h2>📅 When are you traveling?</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-white/60">Date (Optional)</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg"
          />
        </div>
        <div>
          <label className="text-xs text-white/60">Time (Optional)</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-2 rounded-lg"
          />
        </div>
      </div>
      <button onClick={() => proceedToStep6(date, time)}>
        Next: Pickup Location
      </button>
    </div>
  );
}
```

### STEP 6: Pickup Location (LLM-PREDICTED)

```typescript
function Step6PickupLocation() {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [llmPrediction, setLlmPrediction] = useState(null);

  // As user types, get LLM suggestions
  async function handleInputChange(value) {
    setInput(value);

    if (value.length >= 2) {
      // Get suggestions from backend
      const response = await fetch('/api/locations/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: value, limit: 5 })
      });

      const data = await response.json();
      setSuggestions(data.suggestions);

      // Optional: Get LLM prediction of best match
      if (data.suggestions.length > 0) {
        const topMatch = data.suggestions[0];
        setLlmPrediction({
          name: topMatch.name,
          reason: `Best match for "${value}"`,
          confidence: topMatch.match_score
        });
      }
    }
  }

  // When user selects location
  async function selectLocation(location) {
    const validation = await fetch('/api/bot/location', {
      method: 'POST',
      body: JSON.stringify({ location: location.name })
    }).then(r => r.json());

    if (validation.success) {
      setSelectedLocation(validation.data);
      // Show map preview
      showMapPreview(validation.data.coordinates);
    }
  }

  return (
    <div>
      <h2>📍 Where are you traveling from?</h2>
      
      {/* LLM Prediction */}
      {llmPrediction && (
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
          <p className="text-sm text-blue-300">
            💡 {llmPrediction.reason}
          </p>
          <button
            onClick={() => selectLocation({name: llmPrediction.name})}
            className="mt-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded text-sm"
          >
            ✓ Use "{llmPrediction.name}"
          </button>
        </div>
      )}

      {/* Location Input */}
      <input
        type="text"
        placeholder="Type location..."
        value={input}
        onChange={(e) => handleInputChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg mb-3"
      />

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2 mb-4">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => selectLocation(suggestion)}
              className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 text-left"
            >
              <p className="font-semibold">{suggestion.name}</p>
              <p className="text-xs text-white/60">{suggestion.district}</p>
            </button>
          ))}
        </div>
      )}

      {/* Map Preview */}
      {selectedLocation && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10">
          <p className="text-sm text-green-300">
            ✓ {selectedLocation.name} selected
          </p>
          {/* Show map with pinned location */}
          <MapComponent 
            lat={selectedLocation.coordinates.lat}
            lng={selectedLocation.coordinates.lng}
          />
        </div>
      )}

      <button onClick={() => proceedToStep7(selectedLocation)}>
        Next: Drop Location
      </button>
    </div>
  );
}
```

### STEP 7: Drop Location (LLM-PREDICTED & MAP-BASED)

```typescript
function Step7DropLocation({ pickupLocation }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [estimatedAmount, setEstimatedAmount] = useState(null);

  // As user types, get LLM suggestions + calculate distance
  async function handleInputChange(value) {
    setInput(value);

    if (value.length >= 2) {
      const response = await fetch('/api/locations/suggest', {
        method: 'POST',
        body: JSON.stringify({ query: value, limit: 5 })
      });

      const data = await response.json();
      setSuggestions(data.suggestions);
    }
  }

  // When user selects drop location
  async function selectDropLocation(location) {
    const validation = await fetch('/api/bot/location', {
      method: 'POST',
      body: JSON.stringify({ location: location.name })
    }).then(r => r.json());

    if (validation.success) {
      setSelectedLocation(validation.data);

      // Calculate distance
      const distanceResult = await fetch('/api/locations/distance', {
        method: 'POST',
        body: JSON.stringify({
          from: pickupLocation.name,
          to: validation.data.name
        })
      }).then(r => r.json());

      if (distanceResult.success) {
        setDistance(distanceResult.distance_km);
        
        // Calculate estimated amount (based on vehicle + distance)
        const amount = distanceResult.distance_km * selectedVehicle.pricePerKm;
        setEstimatedAmount(amount);
      }

      // Show map preview with route
      showMapRoutePreview(
        pickupLocation.coordinates,
        validation.data.coordinates
      );
    }
  }

  return (
    <div>
      <h2>📍 Where are you going?</h2>

      {/* Show distance & amount real-time */}
      {distance && estimatedAmount && (
        <div className="p-4 rounded-lg bg-gold/10 border border-gold/30 mb-4">
          <p className="text-sm font-semibold text-gold">
            📏 {distance} km
          </p>
          <p className="text-lg font-bold text-gold mt-2">
            ~Rs. {Math.round(estimatedAmount).toLocaleString()}
          </p>
          <p className="text-xs text-gold/70 mt-1">
            Estimated fare
          </p>
        </div>
      )}

      {/* Location input */}
      <input
        type="text"
        placeholder="Type destination..."
        value={input}
        onChange={(e) => handleInputChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg mb-3"
      />

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2 mb-4">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => selectDropLocation(suggestion)}
              className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 text-left"
            >
              <p className="font-semibold">{suggestion.name}</p>
              <p className="text-xs text-white/60">{suggestion.district}</p>
            </button>
          ))}
        </div>
      )}

      {/* Map Preview with Route */}
      {selectedLocation && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10">
          <p className="text-sm text-green-300">
            ✓ {selectedLocation.name} selected
          </p>
          {/* Show map with route from pickup to destination */}
          <MapComponent 
            from={pickupLocation.coordinates}
            to={selectedLocation.coordinates}
            showRoute={true}
            distance={distance}
          />
        </div>
      )}

      <button onClick={() => proceedToEstimate()}>
        Show Estimate
      </button>
    </div>
  );
}
```

### STEP 8-9: Estimate Display

```typescript
function EstimateSummary({
  passengers,
  vehicle,
  acOption,
  tripType,
  pickupLocation,
  dropLocation,
  distance,
  pricePerKm,
  date,
  time
}) {
  const totalAmount = distance * pricePerKm;
  const roundTripAmount = tripType === "Round Trip" ? totalAmount * 2 : totalAmount;

  return (
    <div className="p-6 rounded-lg bg-gold/10 border border-gold/20">
      <h2 className="text-lg font-bold text-white mb-4">
        💰 Your Estimate
      </h2>

      {/* Summary Cards */}
      <div className="grid gap-3 mb-6">
        <SummaryRow label="👥 Passengers" value={passengers} />
        <SummaryRow label="🚗 Vehicle" value={vehicle.name} />
        <SummaryRow label="🌡️ AC Option" value={acOption} />
        <SummaryRow label="🛣️ Trip Type" value={tripType} />
        <SummaryRow label="📍 Pickup" value={pickupLocation.name} />
        <SummaryRow label="📍 Destination" value={dropLocation.name} />
        <SummaryRow label="📏 Distance" value={`${distance} km`} />
        <SummaryRow label="💵 Rate" value={`Rs. ${pricePerKm}/km`} />
        {date && <SummaryRow label="📅 Date" value={date} />}
        {time && <SummaryRow label="⏰ Time" value={time} />}
      </div>

      {/* Total Amount */}
      <div className="p-4 rounded-lg bg-gold/20 border border-gold/40">
        <p className="text-sm text-gold font-semibold">
          ESTIMATED FARE
        </p>
        <p className="text-3xl font-bold text-gold mt-2">
          Rs. {Math.round(roundTripAmount).toLocaleString()}
        </p>
        {tripType === "Round Trip" && (
          <p className="text-xs text-gold/70 mt-2">
            ({distance} km × 2 for round trip)
          </p>
        )}
      </div>

      {/* Book Button */}
      <button 
        onClick={bookOnWhatsApp}
        className="w-full mt-6 py-4 bg-whatsapp text-white font-bold rounded-lg"
      >
        📱 Book on WhatsApp
      </button>
    </div>
  );
}
```

---

## Key Features of This Flow

✅ **Progressive Filtering**
- Passengers → Only show matching vehicles
- Vehicle → Only show available AC/Non-AC options

✅ **Real-time Estimation**
- Distance updates as user selects drop location
- Amount shown immediately

✅ **LLM-Powered Prediction**
- Suggests best location match as user types
- Shows confidence score
- One-click selection of suggested location

✅ **Map Integration**
- Preview location on map
- Show route between pickup and drop
- Display distance visually

✅ **Smart Conditionals**
- Skip AC/Non-AC step if only one option
- Show Round Trip amount × 2
- Optional date/time fields

✅ **Clean Summary**
- All choices displayed before booking
- Clear amount breakdown
- Direct WhatsApp booking

---

## Data Sent to /bot/calculate

```json
{
  "serviceType": "Passenger",
  "passengers": 5,
  "vehicle": "Toyota Hiace",
  "acOption": "AC",
  "tripType": "One Way",
  "pickup": "Colombo",
  "destination": "Kandy",
  "distance": 115,
  "date": "2026-06-15",
  "time": "10:00"
}
```

**Backend:**
- Gets vehicle rates from database
- Calculates: distance × pricePerKm
- Returns estimated fare

---

## Flow Advantage

✅ No wasted fields (only show what's relevant)
✅ Real-time feedback (distance updates instantly)
✅ LLM helps pick best location (not just search)
✅ Map shows actual route
✅ Progressive complexity (simple → complex)
✅ Fast booking (minimal steps)

**This is the perfect booking experience!** ✓

