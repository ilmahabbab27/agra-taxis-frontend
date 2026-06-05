import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
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
import { classifyHillCountry } from "@/lib/location-services";

type PricingSummary = {
  vehicle: string;
  category: string;
  seats: number;
  pickup: string;
  destination: string;
  pickupHill: boolean;
  destinationHill: boolean;
  isHillCountry: boolean;
  stops: string[];
  date: string;
  days: string;
  trip: string;
  pax: string;
  ac: string;
  pricePerKm: number;
  effectivePricePerKm: number;
  includedKm: number;
  additionalKm: number;
  billableKm: number;
  includedDistanceCharge: number;
  additionalDistanceCharge: number;
  basePackageCharge: number;
  distanceKm: number | null;
  estimatedFare: number | null;
  pickupPin: PinPoint | null;
  destinationPin: PinPoint | null;
  distanceSource: "route" | "straight" | undefined;
};

const INCLUDED_KM_PER_DAY = 100;
const stepTitles = ["Passengers", "Route", "Trip", "Charges", "Estimate"];

export function BookingForm() {
  const [vehicleList, setVehicleList] = useState<VehicleCatalogItem[]>(() => getVehicles());
  const [categoryList, setCategoryList] = useState(() => getVehicleCategories());
  const [form, setForm] = useState({
    vehicle: vehicleList[0]?.name || "",
    pickup: "",
    destination: "",
    date: "",
    time: "",
    days: "1",
    trip: "One Way",
    pax: "1",
    ac: "AC",
  });
  const [step, setStep] = useState(0);
  const [pickupPin, setPickupPin] = useState<PinPoint | null>(null);
  const [destinationPin, setDestinationPin] = useState<PinPoint | null>(null);
  const [stops, setStops] = useState<PinPoint[]>([]);
  const [stopLabels, setStopLabels] = useState<string[]>([]);
  const [distance, setDistance] = useState<RouteDistance | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [summary, setSummary] = useState<PricingSummary | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const paxCount = Number(form.pax) || 0;
  const selectedVehicle = vehicleList.length ? getVehicleByName(form.vehicle, vehicleList) : null;
  const relevantVehicles = useMemo(
    () => vehicleList.filter((vehicle) => vehicle.seats >= paxCount),
    [vehicleList, paxCount],
  );
  const selectedHillCountry =
    Boolean(pickupPin && classifyHillCountry({}, pickupPin).isHillCountry) ||
    Boolean(destinationPin && classifyHillCountry({}, destinationPin).isHillCountry);
  const selectedPricePerKm = selectedVehicle
    ? getPricePerKm(selectedVehicle, form.ac, form.trip, selectedHillCountry)
    : 0;
  const basePackageCharge = selectedVehicle
    ? getPackageCharge(selectedVehicle, Number(form.days) || 1, form.ac, selectedHillCountry)
    : 0;

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

  useEffect(() => {
    if (!relevantVehicles.length) return;
    const current = getVehicleByName(form.vehicle, vehicleList);
    if (!current || current.seats < paxCount) {
      setForm((prev) => ({ ...prev, vehicle: relevantVehicles[0].name }));
    }
  }, [paxCount, relevantVehicles, form.vehicle, vehicleList]);

  function validateStep(currentStep: number): boolean {
    const next: typeof errors = {};
    if (currentStep === 0) {
      if (!form.pax || Number(form.pax) < 1) next.pax = "At least 1 passenger";
      if (!relevantVehicles.length) next.pax = "No vehicle matches this passenger count";
    }
    if (currentStep === 1) {
      if (!pickupPin) next.pickup = "Select pickup";
      if (!destinationPin) next.destination = "Select destination";
    }
    if (currentStep === 2) {
      if (!form.days || Number(form.days) < 1) next.days = "At least 1 day";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, stepTitles.length - 1));
  }

  function goBack() {
    setSummary(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function checkPricing(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVehicle || step !== 4) return;
    if (!validateStep(2)) return;
    if (!validateStep(1)) return;

    const totalKm = distance?.km ?? null;
    const includedKm = Number(form.days || 1) * INCLUDED_KM_PER_DAY;
    const additionalKm = totalKm && totalKm > includedKm ? Number((totalKm - includedKm).toFixed(1)) : 0;
    const billableKm = totalKm && !basePackageCharge ? Math.min(totalKm, includedKm) : 0;
    const includedDistanceCharge = basePackageCharge || (billableKm && selectedPricePerKm ? billableKm * selectedPricePerKm : 0);
    const additionalDistanceCharge = additionalKm && selectedPricePerKm ? additionalKm * selectedPricePerKm : 0;
    const fare = totalKm && selectedPricePerKm ? includedDistanceCharge + additionalDistanceCharge : null;
    setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    setSummary({
      vehicle: form.vehicle,
      category: selectedVehicle.category,
      seats: selectedVehicle.seats,
      pickup: form.pickup,
      destination: form.destination,
      pickupHill: pickupPin ? classifyHillCountry({}, pickupPin).isHillCountry : false,
      destinationHill: destinationPin ? classifyHillCountry({}, destinationPin).isHillCountry : false,
      isHillCountry: selectedHillCountry,
      stops: stopLabels.filter(Boolean),
      date: form.date,
      time: form.time,
      days: form.days,
      trip: form.trip,
      pax: form.pax,
      ac: form.ac,
      pricePerKm: selectedPricePerKm,
      effectivePricePerKm: selectedPricePerKm,
      includedKm,
      additionalKm,
      billableKm,
      includedDistanceCharge,
      additionalDistanceCharge,
      basePackageCharge,
      distanceKm: totalKm,
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
Pickup hill country: ${summary.pickupHill ? "Yes" : "No"}
Destination hill country: ${summary.destinationHill ? "Yes" : "No"}
Date: ${summary.date}
Time: ${summary.time || "Not specified"}
Days: ${summary.days}
Trip: ${summary.trip}
Passengers: ${summary.pax}
AC / Non AC: ${summary.ac}
Price per km: ${summary.pricePerKm ? formatLkr(summary.pricePerKm) : "N/A"}
Distance: ${summary.distanceKm ? `${summary.distanceKm} km ${summary.distanceSource === "route" ? "by road" : "straight line"}` : "Not calculated"}
Estimated Fare: ${summary.estimatedFare ? formatLkr(summary.estimatedFare) : "Not calculated"}
Included km: ${summary.includedKm} km
Extra km: ${summary.additionalKm || 0} km
Base/package charge: ${summary.includedDistanceCharge ? formatLkr(summary.includedDistanceCharge) : "N/A"}
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
      <div className="pointer-events-none absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
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
            Step through the booking one screen at a time so the estimate matches what the customer actually needs.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-12 overflow-hidden border border-white/8 bg-white/[0.02]">
          <div className="border-b border-white/8 px-5 py-4 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
                Step {step + 1} - {stepTitles[step]}
              </p>
              <div className="flex items-center gap-2">
                {stepTitles.map((title, index) => (
                  <span
                    key={title}
                    className={`flex h-2.5 w-2.5 rounded-full ${index <= step ? "bg-gold" : "bg-white/15"}`}
                    title={title}
                  />
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={checkPricing}>
            <div className="p-5 sm:p-8">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="step-0" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-5 sm:grid-cols-2">
                    <Field label="Passenger Count" error={errors.pax}>
                      <input type="number" min={1} max={60} value={form.pax} onChange={(e) => update("pax", e.target.value)} className={inputCls("pax")} />
                      <p className="mt-1 text-xs text-white/35">
                        {relevantVehicles.length} vehicle{relevantVehicles.length === 1 ? "" : "s"} fit this passenger count.
                      </p>
                    </Field>

                    <Field label="Suggested Vehicle">
                      <select value={form.vehicle} onChange={(e) => update("vehicle", e.target.value)} className={inputCls()}>
                        {!relevantVehicles.length && <option value="">No vehicles available</option>}
                        {categoryList.filter((category) => category !== "All").map((category) => (
                          <optgroup key={category} label={category}>
                            {relevantVehicles.filter((vehicle) => vehicle.category === category).map((vehicle) => (
                              <option key={vehicle.name} value={vehicle.name}>
                                {vehicle.name} - {vehicle.seats} seats
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </Field>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="step-1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                      <CheckCircle2 className="h-4 w-4 text-gold" />
                      Pickup and destination shape the route, hill-country detection, and pricing.
                    </div>
                    <div className="mb-5 grid gap-5 sm:grid-cols-2">
                      <Field label="Trip Type">
                        <select value={form.trip} onChange={(e) => update("trip", e.target.value)} className={inputCls()}>
                          <option>One Way</option>
                          <option>Round Trip</option>
                        </select>
                      </Field>
                    </div>
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
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step-2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-5 sm:grid-cols-2">
                    <Field label="Travel Date (Optional)" error={errors.date}>
                      <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className={inputCls("date")} />
                    </Field>
                    <Field label="Travel Time (Optional)">
                      <input type="time" value={form.time} onChange={(e) => update("time", e.target.value)} className={inputCls()} />
                    </Field>
                    <Field label="Number of Days" error={errors.days}>
                      <input type="number" min={1} value={form.days} onChange={(e) => update("days", e.target.value)} className={inputCls("days")} />
                    </Field>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step-3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-5 sm:grid-cols-2">
                    <Field label="AC / Non AC">
                      <select disabled={!selectedVehicle} value={form.ac} onChange={(e) => update("ac", e.target.value)} className={inputCls()}>
                        {selectedVehicle?.acAvailable && <option value="AC">AC - {formatLkr(getPricePerKm(selectedVehicle, "AC", form.trip, selectedHillCountry))} / km</option>}
                        {selectedVehicle?.nonAcAvailable && <option value="Non AC">Non AC - {formatLkr(getPricePerKm(selectedVehicle, "Non AC", form.trip, selectedHillCountry))} / km</option>}
                      </select>
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <SummaryRow label="Route type" value={selectedHillCountry ? "Hill country" : "Normal"} />
                      <SummaryRow label="Charge per km" value={selectedPricePerKm ? formatLkr(selectedPricePerKm) : "N/A"} />
                      <SummaryRow label="Package charge" value={basePackageCharge ? formatLkr(basePackageCharge) : "Per-km only"} />
                      <SummaryRow label="Included km" value={`${Number(form.days || 1) * INCLUDED_KM_PER_DAY} km`} />
                    </div>
                    <div className="sm:col-span-2 border border-white/10 bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/60">
                      Charges are selected after route detection. Hill-country pricing is used when either pickup or destination is detected as hill country.
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="step-4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <SummaryRow label="Vehicle" value={selectedVehicle?.name || form.vehicle || "Pending"} />
                        <SummaryRow label="Passengers" value={form.pax} />
                        <SummaryRow label="AC / Non AC" value={form.ac} />
                        <SummaryRow label="Pickup hill country" value={pickupPin ? (classifyHillCountry({}, pickupPin).isHillCountry ? "Yes" : "No") : "Pending"} />
                        <SummaryRow label="Destination hill country" value={destinationPin ? (classifyHillCountry({}, destinationPin).isHillCountry ? "Yes" : "No") : "Pending"} />
                        <SummaryRow label="Price per km" value={selectedPricePerKm ? formatLkr(selectedPricePerKm) : "N/A"} />
                        <SummaryRow label="Package charge" value={basePackageCharge ? formatLkr(basePackageCharge) : "Per-km only"} />
                        <SummaryRow label="Included km" value={`${Number(form.days || 1) * INCLUDED_KM_PER_DAY} km`} />
                      </div>
                      {Number(form.days) > 1 && (
                        <div className="border border-white/10 bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/60">
                          This trip includes {Number(form.days) * INCLUDED_KM_PER_DAY} km total ({form.days} day{Number(form.days) === 1 ? "" : "s"} x {INCLUDED_KM_PER_DAY} km). Extra distance is charged when the trip goes beyond that limit.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="border-t border-white/8 px-5 py-4 sm:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={goBack} disabled={step === 0} className="inline-flex items-center justify-center gap-2 border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 disabled:cursor-not-allowed disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>

                {step < stepTitles.length - 1 ? (
                  <button type="button" onClick={goNext} className="inline-flex items-center justify-center gap-2 bg-gold px-5 py-3 text-sm font-black uppercase tracking-widest text-charcoal shadow-gold transition-all hover:brightness-110">
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button type="submit" className="inline-flex items-center justify-center gap-2 bg-gold px-5 py-3 text-sm font-black uppercase tracking-widest text-charcoal shadow-gold transition-all hover:brightness-110">
                    Check Pricing - Get Fare Estimate
                  </button>
                )}
              </div>
            </div>
            <div className="border-t border-white/8 px-6 py-4 sm:px-10">
              <p className="text-center text-xs text-white/25">Your details are only shared with Agra Taxis via WhatsApp after you confirm.</p>
            </div>
          </form>
        </motion.div>

        <AnimatePresence>
          {summary && (
            <motion.div ref={summaryRef} key="summary" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.4 }} className="mt-6 border border-gold/15 bg-[#121214] p-5 text-white sm:p-6">
              <h3 className="mb-5 flex items-center justify-between border-b border-white/10 pb-3 text-lg font-bold text-white">
                <span>Fare Summary</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Agra Connect</span>
              </h3>

              <p className="text-base leading-7 text-white/80">
                Your estimated fare is{" "}
                <span className="font-bold text-gold">
                  {summary.estimatedFare ? formatLkr(summary.estimatedFare) : "pending"}
                </span>
                {" "}for{" "}
                <span className="font-semibold text-white">
                  {summary.vehicle}
                </span>
                {" "}from{" "}
                <span className="font-semibold text-white">
                  {summary.pickup || "pickup"}
                </span>
                {" "}to{" "}
                <span className="font-semibold text-white">
                  {summary.destination || "destination"}
                </span>
                {" "}for{" "}
                <span className="font-semibold text-white">
                  {summary.days} day{Number(summary.days) === 1 ? "" : "s"}
                </span>
                {" "}and{" "}
                <span className="font-semibold text-white">
                  {summary.pax} passenger{Number(summary.pax) === 1 ? "" : "s"}
                </span>
                .
              </p>

              <p className="mt-3 text-xs leading-relaxed text-white/45">
                This is an estimate only. Final pricing may change based on route conditions, stops, waiting time, and the actual trip duration.
              </p>

              {!summary.distanceKm && <p className="mt-3 text-xs text-amber-400">Add pickup and destination for the fare estimate.</p>}

              <button type="button" onClick={reserveOnWhatsApp} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-whatsapp py-4 text-sm font-bold uppercase tracking-wider text-white shadow-card transition-all hover:bg-whatsapp/90">
                <WhatsAppIcon className="h-5 w-5" />
                Reserve on WhatsApp
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {summary && Number(summary.days) > 1 && (
          <p className="mt-3 px-1 text-xs leading-relaxed text-white/45">
            Price chart: day plan package includes up to {INCLUDED_KM_PER_DAY} km per day. For {summary.days} day{Number(summary.days) === 1 ? "" : "s"}, the total included limit is {Number(summary.days) * INCLUDED_KM_PER_DAY} km, and additional charges may apply per km after that.
          </p>
        )}
      </div>
    </section>
  );
}

function getPackageCharge(vehicle: VehicleCatalogItem, days: number, ac: string, isHillCountry: boolean) {
  const dayKey = `day${Math.max(1, Math.floor(days))}`;
  const packageRow = vehicle.package1Prices?.[dayKey];
  if (!packageRow) return 0;
  if (ac === "Non AC") return isHillCountry ? packageRow.nonAcHill : packageRow.nonAcNormal;
  return isHillCountry ? packageRow.acHill : packageRow.acNormal;
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
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </span>
      )}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/5 px-4 py-3">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-gold">{label}</span>
      <span className="mt-0.5 block text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
