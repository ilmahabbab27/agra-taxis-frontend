import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { waLink } from "@/lib/contact";
import { saveBooking } from "@/lib/admin-store";
import {
  LocationMapPicker,
  type PinPoint,
  type RouteDistance,
} from "@/components/LocationMapPicker";
import {
  formatLkr,
  getPricePerKm,
  getVehicleCategories,
  getVehicleCategoriesFromDatabase,
  getVehicleByName,
  getVehicles,
  getVehiclesFromDatabase,
  type VehicleCatalogItem,
} from "@/lib/vehicle-catalog";

type PricingSummary = {
  vehicle: string;
  category: string;
  seats: number;
  pickup: string;
  destination: string;
  stops: string[];
  date: string;
  days: string;
  trip: string;
  pax: string;
  ac: string;
  pricePerKm: number;
  distanceKm: number | null;
  estimatedFare: number | null;
  pickupPin: PinPoint | null;
  destinationPin: PinPoint | null;
  distanceSource: "route" | "straight" | undefined;
};

export function BookingForm() {
  const [vehicleList, setVehicleList] = useState<VehicleCatalogItem[]>(() => getVehicles());
  const [categoryList, setCategoryList] = useState(() => getVehicleCategories());
  const [form, setForm] = useState({
    vehicle: vehicleList[0]?.name || "",
    pickup: "",
    destination: "",
    date: "",
    days: "1",
    trip: "One Way",
    pax: "1",
    ac: "AC",
  });
  const [pickupPin, setPickupPin] = useState<PinPoint | null>(null);
  const [destinationPin, setDestinationPin] = useState<PinPoint | null>(null);
  const [stops, setStops] = useState<PinPoint[]>([]);
  const [stopLabels, setStopLabels] = useState<string[]>([]);
  const [distance, setDistance] = useState<RouteDistance | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [summary, setSummary] = useState<PricingSummary | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const selectedVehicle = vehicleList.length ? getVehicleByName(form.vehicle, vehicleList) : null;
  const selectedPricePerKm = selectedVehicle ? getPricePerKm(selectedVehicle, form.ac) : 0;

  function update<K extends keyof typeof form>(k: K, v: string) {
    setErrors((e) => ({ ...e, [k]: undefined }));
    setSummary(null);
    setForm((f) => {
      if (k === "vehicle") {
        const nextVehicle = getVehicleByName(v, vehicleList);
        const nextAc =
          f.ac === "Non AC" && !nextVehicle.nonAcAvailable
            ? "AC"
            : f.ac === "AC" && !nextVehicle.acAvailable
              ? "Non AC"
              : f.ac;
        return { ...f, vehicle: v, ac: nextAc };
      }
      return { ...f, [k]: v };
    });
  }

  useEffect(() => {
    setSummary(null);
  }, [distance]);

  useEffect(() => {
    let cancelled = false;
    async function loadVehicles() {
      let nextVehicles = getVehicles();
      let nextCategories = getVehicleCategories();
      try {
        [nextVehicles, nextCategories] = await Promise.all([
          getVehiclesFromDatabase(),
          getVehicleCategoriesFromDatabase(),
        ]);
      } catch {
        // Local fallback keeps the inquiry form usable if the backend is offline.
      }
      if (cancelled) return;
      setCategoryList(nextCategories);
      setVehicleList(nextVehicles);
      setForm((current) => {
        if (nextVehicles.some((vehicle) => vehicle.name === current.vehicle)) return current;
        return { ...current, vehicle: nextVehicles[0]?.name || "" };
      });
    }
    void loadVehicles();
    return () => {
      cancelled = true;
    };
  }, []);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.date) next.date = "Travel date is required";
    if (!form.pax || Number(form.pax) < 1) next.pax = "At least 1 passenger";
    if (!form.days || Number(form.days) < 1) next.days = "At least 1 day";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function checkPricing(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVehicle) return;
    if (!validate()) return;

    const fare = distance && selectedPricePerKm ? distance.km * selectedPricePerKm : null;

    setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    setSummary({
      vehicle: form.vehicle,
      category: selectedVehicle.category,
      seats: selectedVehicle.seats,
      pickup: form.pickup,
      destination: form.destination,
      stops: stopLabels.filter(Boolean),
      date: form.date,
      days: form.days,
      trip: form.trip,
      pax: form.pax,
      ac: form.ac,
      pricePerKm: selectedPricePerKm,
      distanceKm: distance?.km ?? null,
      estimatedFare: fare,
      pickupPin,
      destinationPin,
      distanceSource: distance?.source,
    });
  }

  function reserveOnWhatsApp() {
    if (!summary || !selectedVehicle) return;

    const mapUrl =
      summary.pickupPin && summary.destinationPin
        ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(
            `${summary.pickupPin.lat},${summary.pickupPin.lng};${summary.destinationPin.lat},${summary.destinationPin.lng}`,
          )}`
        : "";

    const booking = {
      ...form,
      pickupLat: summary.pickupPin ? String(summary.pickupPin.lat) : "",
      pickupLng: summary.pickupPin ? String(summary.pickupPin.lng) : "",
      destinationLat: summary.destinationPin ? String(summary.destinationPin.lat) : "",
      destinationLng: summary.destinationPin ? String(summary.destinationPin.lng) : "",
      distanceKm: summary.distanceKm ? String(summary.distanceKm) : "",
      distanceSource: summary.distanceSource,
      vehicleCategory: summary.category,
      vehicleSeats: String(summary.seats),
      pricePerKm: summary.pricePerKm ? String(summary.pricePerKm) : "",
      estimatedFare: summary.estimatedFare ? String(Math.round(summary.estimatedFare)) : "",
      mapUrl,
    };

    try {
      saveBooking(booking);
    } catch {
      // Best-effort local storage.
    }

    const msg = `Ayubowan. Welcome to Agra Taxis.

*New Booking Inquiry*
Vehicle: ${summary.vehicle}
Category: ${summary.category}
Seats: ${summary.seats}
Pickup: ${summary.pickup}${summary.stops.length ? "\n" + summary.stops.map((s, i) => `Stop ${i + 1}: ${s}`).join("\n") : ""}
Destination: ${summary.destination}
Date: ${summary.date}
Days: ${summary.days}
Trip: ${summary.trip}
Passengers: ${summary.pax}
AC / Non AC: ${summary.ac}
Price per km: ${summary.pricePerKm ? formatLkr(summary.pricePerKm) : "N/A"}
Distance: ${summary.distanceKm ? `${summary.distanceKm} km ${summary.distanceSource === "route" ? "by road" : "straight line"}` : "Not calculated"}
Estimated Fare: ${summary.estimatedFare ? formatLkr(summary.estimatedFare) : "Not calculated"}
Map Route: ${mapUrl || "Not available"}

Thank you!`;

    window.open(waLink(msg), "_blank");
  }

  const inputCls = (field?: keyof typeof form) =>
    `w-full px-4 py-3.5 bg-white border rounded-xl text-charcoal text-sm font-medium outline-none transition-all placeholder-charcoal/30 focus:ring-2 focus:ring-gold/30 focus:border-gold/50 ${
      field && errors[field] ? "border-red-400 bg-red-50/30" : "border-border hover:border-charcoal/20"
    }`;

  return (
    <section id="booking" className="relative overflow-hidden bg-[#0e0f11] py-24 lg:py-32">
      {/* Subtle grid pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      {/* Gold glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3">
            <span className="h-px w-6 bg-gold" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Booking Inquiry</span>
            <span className="h-px w-6 bg-gold" />
          </div>
          <h2 className="mt-5 text-balance text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
            Request a Vehicle
            <span className="block text-white/30">Reservation</span>
          </h2>
          <p className="mt-4 text-base text-white/45">
            Fill in your trip details, check pricing, then reserve on WhatsApp.
          </p>
        </motion.div>

        <motion.form
          onSubmit={checkPricing}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-12 overflow-hidden rounded-3xl border border-white/8 bg-white/4 backdrop-blur-sm"
        >
          {/* Form header */}
          <div className="border-b border-white/8 px-6 py-5 sm:px-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Step 1 — Trip Details</p>
          </div>
          <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-10">
            <Field label="Required Vehicle">
              <select
                required
                disabled={!selectedVehicle}
                value={form.vehicle}
                onChange={(e) => update("vehicle", e.target.value)}
                className={inputCls()}
              >
                {!selectedVehicle && <option value="">No vehicles available</option>}
                {categoryList
                  .filter((category) => category !== "All")
                  .map((category) => (
                    <optgroup key={category} label={category}>
                      {vehicleList
                        .filter((vehicle) => vehicle.category === category)
                        .map((vehicle) => (
                          <option key={vehicle.name} value={vehicle.name}>
                            {vehicle.name} - {vehicle.seats} seats
                          </option>
                        ))}
                    </optgroup>
                  ))}
              </select>
            </Field>

            <Field label="Passenger Count" error={errors.pax}>
              <input
                type="number"
                min={1}
                max={60}
                value={form.pax}
                onChange={(e) => update("pax", e.target.value)}
                className={inputCls("pax")}
              />
            </Field>

            <Field label="Travel Date" error={errors.date}>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className={inputCls("date")}
              />
            </Field>

            <Field label="Number of Days" error={errors.days}>
              <input
                type="number"
                min={1}
                value={form.days}
                onChange={(e) => update("days", e.target.value)}
                className={inputCls("days")}
              />
            </Field>

            <Field label="Trip Type">
              <select
                value={form.trip}
                onChange={(e) => update("trip", e.target.value)}
                className={inputCls()}
              >
                <option>One Way</option>
                <option>Round Trip</option>
              </select>
            </Field>

            <Field label="AC / Non AC">
              <select
                disabled={!selectedVehicle}
                value={form.ac}
                onChange={(e) => update("ac", e.target.value)}
                className={inputCls()}
              >
                {selectedVehicle?.acAvailable && (
                  <option value="AC">AC - {formatLkr(selectedVehicle.acPricePerKm)} / km</option>
                )}
                {selectedVehicle?.nonAcAvailable && (
                  <option value="Non AC">
                    Non AC - {formatLkr(selectedVehicle.nonAcPricePerKm)} / km
                  </option>
                )}
              </select>
            </Field>

            <LocationMapPicker
              pickup={pickupPin}
              destination={destinationPin}
              pickupLabel={form.pickup}
              destinationLabel={form.destination}
              stops={stops}
              stopLabels={stopLabels}
              isRoundTrip={form.trip === "Round Trip"}
              onPickupChange={setPickupPin}
              onDestinationChange={setDestinationPin}
              onStopsChange={setStops}
              onStopLabelsChange={setStopLabels}
              onPickupLabelChange={(value) => update("pickup", value)}
              onDestinationLabelChange={(value) => update("destination", value)}
              onDistanceChange={setDistance}
            />
          </div>

          <div className="px-6 pb-6 sm:px-10 sm:pb-10">
            <button
              type="submit"
              disabled={!selectedVehicle}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-gold py-4 text-sm font-black uppercase tracking-widest text-charcoal shadow-gold transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Check Pricing — Get Fare Estimate
            </button>
          </div>
          <div className="border-t border-white/8 px-6 py-4 sm:px-10">
            <p className="text-center text-xs text-white/25">Your details are only shared with Agra Taxis via WhatsApp after you confirm.</p>
          </div>
        </motion.form>

        <AnimatePresence>
          {summary && (
            <motion.div
              ref={summaryRef}
              key="summary"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.4 }}
              className="mt-6 bg-charcoal text-white rounded-2xl p-6 sm:p-8 shadow-card border border-gold/20 relative overflow-hidden"
            >
              <h3 className="text-lg font-bold text-white mb-5 border-b border-white/10 pb-3 flex items-center justify-between">
                <span>Trip Summary Details</span>
                <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Agra Connect</span>
              </h3>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <SummaryRow label="Vehicle" value={summary.vehicle} />
                <SummaryRow label="Category" value={summary.category} />
                <SummaryRow label="Seats" value={`${summary.seats} seats`} />
                <SummaryRow label="Pickup" value={summary.pickup} />
                {summary.stops.map((s, i) => (
                  <SummaryRow key={i} label={`Stop ${i + 1}`} value={s} />
                ))}
                <SummaryRow label="Destination" value={summary.destination} />
                <SummaryRow label="Travel Date" value={summary.date} />
                <SummaryRow label="Days" value={summary.days} />
                <SummaryRow label="Trip Type" value={summary.trip} />
                <SummaryRow label="Passengers" value={summary.pax} />
                <SummaryRow label="AC / Non AC" value={summary.ac} />
                <SummaryRow
                  label="Price per km"
                  value={summary.pricePerKm ? formatLkr(summary.pricePerKm) : "N/A"}
                />
                <SummaryRow
                  label="Distance"
                  value={
                    summary.distanceKm
                      ? `${summary.distanceKm} km ${summary.distanceSource === "route" ? "by road" : "straight line"}`
                      : "Not calculated"
                  }
                />
              </div>

              <div className="mt-6 rounded-lg border-2 border-dashed border-white/10 bg-white/5 px-6 py-4 flex items-center justify-between">
                <span className="text-white/60 font-semibold text-sm">Estimated Total Fare</span>
                <span className="text-2xl font-bold text-gold">
                  {summary.estimatedFare ? formatLkr(summary.estimatedFare) : "Pending"}
                </span>
              </div>

              {!summary.distanceKm && (
                <p className="mt-3 flex items-center gap-2 text-xs text-amber-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Pin your pickup and destination on the map above for an accurate fare estimate.
                </p>
              )}

              <div className="mt-5 rounded-lg bg-white/5 border border-white/10 px-5 py-4 flex gap-3">
                <AlertCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <p className="text-xs text-white/70 leading-relaxed">
                  <strong className="text-white font-semibold">Verification Notice:</strong> All fares are automated estimates. Final invoices may vary depending on road conditions, tolls, and custom itinerary requests. Establish contact via phone or WhatsApp to finalize your B2B/standard booking agreement.
                </p>
              </div>

              <button
                type="button"
                onClick={reserveOnWhatsApp}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp/90 text-white font-bold py-4 rounded-lg shadow-card transition-all text-sm uppercase tracking-wider cursor-pointer"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Reserve on WhatsApp
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">{label}</span>
      {children}
      {error && (
        <span className="mt-1 flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </span>
      )}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/5 px-4 py-3">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-gold">
        {label}
      </span>
      <span className="mt-0.5 block font-semibold text-white text-sm">{value}</span>
    </div>
  );
}
