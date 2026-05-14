import { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair, Loader2, LocateFixed, MapPin, Plus, Search, X } from "lucide-react";
import {
  getMultiPointRouteDistanceKm,
  hasGoogleLocationKey,
  resolveLocationSuggestion,
  reverseLookupLocation,
  searchLocationSuggestions,
  type LocationSuggestion,
} from "@/lib/location-services";

export type PinPoint = {
  lat: number;
  lng: number;
};

export type RouteDistance = {
  km: number;
  source: "route" | "straight";
};

type LocationMapPickerProps = {
  pickup: PinPoint | null;
  destination: PinPoint | null;
  pickupLabel: string;
  destinationLabel: string;
  stops: PinPoint[];
  stopLabels: string[];
  isRoundTrip: boolean;
  onPickupChange: (point: PinPoint) => void;
  onDestinationChange: (point: PinPoint) => void;
  onStopsChange: (stops: PinPoint[]) => void;
  onStopLabelsChange: (labels: string[]) => void;
  onPickupLabelChange: (label: string) => void;
  onDestinationLabelChange: (label: string) => void;
  onDistanceChange: (distance: RouteDistance | null) => void;
};

type ActivePin = "pickup" | "destination" | { stop: number };

export function LocationMapPicker({
  pickup,
  destination,
  pickupLabel,
  destinationLabel,
  stops,
  stopLabels,
  isRoundTrip,
  onPickupChange,
  onDestinationChange,
  onStopsChange,
  onStopLabelsChange,
  onPickupLabelChange,
  onDestinationLabelChange,
  onDistanceChange,
}: LocationMapPickerProps) {
  const onPickupLabelChangeRef = useRef(onPickupLabelChange);
  const onDestinationLabelChangeRef = useRef(onDestinationLabelChange);
  const onStopLabelsChangeRef = useRef(onStopLabelsChange);

  const [activePin, setActivePin] = useState<ActivePin>("pickup");
  const [distance, setDistance] = useState<RouteDistance | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [pickupSearch, setPickupSearch] = useState(pickupLabel);
  const [destinationSearch, setDestinationSearch] = useState(destinationLabel);
  const [stopSearches, setStopSearches] = useState<string[]>([]);
  const [results, setResults] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    onPickupLabelChangeRef.current = onPickupLabelChange;
    onDestinationLabelChangeRef.current = onDestinationLabelChange;
    onStopLabelsChangeRef.current = onStopLabelsChange;
  }, [onPickupLabelChange, onDestinationLabelChange, onStopLabelsChange]);

  useEffect(() => setPickupSearch(pickupLabel), [pickupLabel]);
  useEffect(() => setDestinationSearch(destinationLabel), [destinationLabel]);
  useEffect(() => setStopSearches(stopLabels), [stopLabels]);

  const reverseGeocode = useCallback(async (point: PinPoint, type: ActivePin) => {
    try {
      const label = await reverseLookupLocation(point);
      if (!label) return;
      if (type === "pickup") {
        onPickupLabelChangeRef.current(label);
        setPickupSearch(label);
      } else if (type === "destination") {
        onDestinationLabelChangeRef.current(label);
        setDestinationSearch(label);
      } else {
        const idx = type.stop;
        onStopLabelsChangeRef.current(
          stopLabels.map((l, i) => (i === idx ? label : l)),
        );
        setStopSearches((prev) => prev.map((l, i) => (i === idx ? label : l)));
      }
    } catch {
      // Coordinates stay even if reverse-geocode fails.
    }
  }, [stopLabels]);

  // Search suggestions
  useEffect(() => {
    let query = "";
    if (activePin === "pickup") query = pickupSearch.trim();
    else if (activePin === "destination") query = destinationSearch.trim();
    else query = (stopSearches[activePin.stop] ?? "").trim();

    if (query.length < 3) {
      setResults([]);
      setSearchError("");
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");
      try {
        const data = await searchLocationSuggestions(query, controller.signal);
        setResults(data);
        setSearchError(data.length ? "" : "No matching places found");
      } catch (error) {
        if ((error as DOMException).name !== "AbortError") {
          setResults([]);
          setSearchError("Location search is temporarily unavailable");
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [activePin, pickupSearch, destinationSearch, stopSearches]);

  // Distance calculation across all points
  useEffect(() => {
    const allPins: (PinPoint | null)[] = [pickup, ...stops, destination];
    const resolved = allPins.filter((p): p is PinPoint => p !== null);

    if (resolved.length < 2) {
      setDistance(null);
      onDistanceChange(null);
      return;
    }

    const controller = new AbortController();

    async function route() {
      setIsRouting(true);
      try {
        const km = await getMultiPointRouteDistanceKm(resolved, controller.signal);
        const total = Number((isRoundTrip ? km * 2 : km).toFixed(1));
        const next: RouteDistance = { km: total, source: "route" };
        setDistance(next);
        onDistanceChange(next);
      } catch {
        const straight = haversineTotal(resolved);
        const total = Number((isRoundTrip ? straight * 2 : straight).toFixed(1));
        const next: RouteDistance = { km: total, source: "straight" };
        setDistance(next);
        onDistanceChange(next);
      } finally {
        setIsRouting(false);
      }
    }

    route();
    return () => controller.abort();
  }, [pickup, destination, stops, isRoundTrip, onDistanceChange]);

  function useCurrentLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const point = {
        lat: Number(position.coords.latitude.toFixed(6)),
        lng: Number(position.coords.longitude.toFixed(6)),
      };
      if (activePin === "pickup") {
        onPickupChange(point);
        reverseGeocode(point, "pickup");
        setActivePin("destination");
      } else if (activePin === "destination") {
        onDestinationChange(point);
        reverseGeocode(point, "destination");
      } else {
        const idx = activePin.stop;
        const next = stops.map((s, i) => (i === idx ? point : s));
        onStopsChange(next);
        reverseGeocode(point, activePin);
      }
    });
  }

  async function selectResult(result: LocationSuggestion) {
    setIsResolving(true);
    setSearchError("");
    try {
      const { label, point } = await resolveLocationSuggestion(result);

      if (activePin === "pickup") {
        onPickupChange(point);
        onPickupLabelChange(label);
        setPickupSearch(label);
        setActivePin(stops.length > 0 ? { stop: 0 } : "destination");
      } else if (activePin === "destination") {
        onDestinationChange(point);
        onDestinationLabelChange(label);
        setDestinationSearch(label);
      } else {
        const idx = activePin.stop;
        const nextPins = stops.map((s, i) => (i === idx ? point : s));
        const nextLabels = stopLabels.map((l, i) => (i === idx ? label : l));
        onStopsChange(nextPins);
        onStopLabelsChange(nextLabels);
        setStopSearches((prev) => prev.map((l, i) => (i === idx ? label : l)));
        setActivePin(idx + 1 < stops.length ? { stop: idx + 1 } : "destination");
      }

      setResults([]);
    } catch {
      setSearchError("Selected location details are temporarily unavailable");
    } finally {
      setIsResolving(false);
    }
  }

  function addStop() {
    onStopsChange([...stops, { lat: 0, lng: 0 }]);
    onStopLabelsChange([...stopLabels, ""]);
    setStopSearches((prev) => [...prev, ""]);
    setActivePin({ stop: stops.length });
  }

  function removeStop(idx: number) {
    onStopsChange(stops.filter((_, i) => i !== idx));
    onStopLabelsChange(stopLabels.filter((_, i) => i !== idx));
    setStopSearches((prev) => prev.filter((_, i) => i !== idx));
    setActivePin("pickup");
  }

  function isActive(pin: ActivePin) {
    if (typeof pin === "string" && typeof activePin === "string") return pin === activePin;
    if (typeof pin === "object" && typeof activePin === "object") return pin.stop === activePin.stop;
    return false;
  }

  return (
    <div className="sm:col-span-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="block text-sm font-medium text-charcoal">
            Search pickup, stops & destination
          </span>
          <span className="text-xs text-muted-foreground">
            {hasGoogleLocationKey() ? "Powered by Google location search." : "Powered by OpenStreetMap."}
            {isRoundTrip && " Distance doubled for round trip."}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PinButton label="Pickup" icon={<MapPin className="h-3.5 w-3.5" />} active={isActive("pickup")} onClick={() => setActivePin("pickup")} />
          {stops.map((_, i) => (
            <PinButton
              key={i}
              label={`Stop ${i + 1}`}
              icon={<MapPin className="h-3.5 w-3.5 text-amber-500" />}
              active={isActive({ stop: i })}
              onClick={() => setActivePin({ stop: i })}
            />
          ))}
          <PinButton label="Drop" icon={<Crosshair className="h-3.5 w-3.5" />} active={isActive("destination")} onClick={() => setActivePin("destination")} />
          <button
            type="button"
            onClick={addStop}
            className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-2 text-xs font-semibold text-charcoal hover:bg-accent"
            title="Add a middle stop"
          >
            <Plus className="h-3.5 w-3.5" /> Stop
          </button>
          <button
            type="button"
            onClick={useCurrentLocation}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-charcoal hover:bg-accent"
            title="Use current location"
          >
            <LocateFixed className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search boxes */}
      <div className="relative mt-3 flex flex-col gap-2">
        <LocationSearchBox
          label="Pickup"
          active={isActive("pickup")}
          icon={<MapPin className="h-4 w-4 text-green-600" />}
          value={pickupSearch}
          placeholder="Search pickup location"
          onFocus={() => setActivePin("pickup")}
          onChange={(value) => {
            setPickupSearch(value);
            onPickupLabelChange(value);
            setActivePin("pickup");
          }}
        />

        {stops.map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1">
              <LocationSearchBox
                label={`Stop ${i + 1}`}
                active={isActive({ stop: i })}
                icon={<MapPin className="h-4 w-4 text-amber-500" />}
                value={stopSearches[i] ?? ""}
                placeholder={`Search stop ${i + 1}`}
                onFocus={() => setActivePin({ stop: i })}
                onChange={(value) => {
                  setStopSearches((prev) => prev.map((l, j) => (j === i ? value : l)));
                  onStopLabelsChange(stopLabels.map((l, j) => (j === i ? value : l)));
                  setActivePin({ stop: i });
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => removeStop(i)}
              className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg bg-secondary hover:bg-red-50 text-red-500"
              title="Remove stop"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        <LocationSearchBox
          label="Drop"
          active={isActive("destination")}
          icon={<Crosshair className="h-4 w-4 text-red-600" />}
          value={destinationSearch}
          placeholder="Search drop location"
          onFocus={() => setActivePin("destination")}
          onChange={(value) => {
            setDestinationSearch(value);
            onDestinationLabelChange(value);
            setActivePin("destination");
          }}
        />

        {(results.length > 0 || isSearching || isResolving || searchError) && (
          <div className="absolute left-0 right-0 top-full z-[1000] mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-card">
            <div className="max-h-64 overflow-y-auto">
              {(isSearching || isResolving) && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isResolving ? "Loading location details..." : "Searching locations..."}
                </div>
              )}
              {!isSearching && !isResolving && results.map((result) => (
                <button
                  key={`${result.provider}-${result.id}`}
                  type="button"
                  onClick={() => selectResult(result)}
                  className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-secondary"
                >
                  <Search className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium leading-snug text-charcoal">{result.label}</span>
                </button>
              ))}
              {!isSearching && !isResolving && searchError && (
                <div className="px-4 py-3 text-sm text-muted-foreground">{searchError}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Distance readout */}
      {(distance || isRouting) && (
        <div className="mt-3 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
          <span>
            {isRouting ? (
              <span className="flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Calculating route…</span>
            ) : distance ? (
              <>
                <span className="font-semibold text-charcoal">{distance.km} km</span>
                {" "}{distance.source === "route" ? "by road" : "straight line"}
                {isRoundTrip && <span className="ml-1 text-gold font-semibold">(×2 round trip)</span>}
                {stops.length > 0 && <span className="ml-1">(via {stops.length} stop{stops.length > 1 ? "s" : ""})</span>}
              </>
            ) : null}
          </span>
        </div>
      )}
    </div>
  );
}

function PinButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
        active ? "bg-charcoal text-white" : "bg-secondary text-charcoal hover:bg-accent"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function LocationSearchBox({
  label,
  active,
  icon,
  value,
  placeholder,
  onFocus,
  onChange,
}: {
  label: string;
  active: boolean;
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  onFocus: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className={`flex items-center gap-3 rounded-xl border bg-background px-4 py-3 transition-all ${
        active ? "border-gold ring-2 ring-gold/30" : "border-border"
      }`}
    >
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onFocus={onFocus}
          onChange={(event) => onChange(event.target.value)}
          className="mt-0.5 w-full bg-transparent text-sm font-semibold text-charcoal outline-none placeholder:text-muted-foreground"
        />
      </span>
    </label>
  );
}

function haversineTotal(points: PinPoint[]): number {
  let total = 0;
  for (let i = 0; i + 1 < points.length; i++) {
    total += haversineKm(points[i], points[i + 1]);
  }
  return total;
}

function haversineKm(a: PinPoint, b: PinPoint) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}
