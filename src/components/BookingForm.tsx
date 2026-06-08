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
  getCachedLorriesFromDatabase,
  getCachedVehiclesFromDatabase,
  getPricePerKm,
  getVehicleCategories,
  getVehicleCategoriesFromDatabase,
  getLorriesFromDatabase,
  getVehicleByName,
  getVehicles,
  getVehiclesFromDatabase,
  type LorryRates,
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
    time: string;
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
    oneDayPackageDistanceCharge: number;
    package1Estimate: number | null;
  package2Estimate: number | null;
  distanceKm: number | null;
  estimatedFare: number | null;
  pickupPin: PinPoint | null;
  destinationPin: PinPoint | null;
  distanceSource: "route" | "straight" | undefined;
};

const INCLUDED_KM_PER_DAY = 150;
const stepTitles = ["Vehicle Type", "Passengers", "Route", "Charges", "Estimate"];
const fallbackLorryRates: LorryRates = {
  "7ft": {
    type: "7 FT",
    hillExtraPerKm: 10,
    start: 2500,
    extra: 160,
    upDown: 120,
    waiting: 600,
    waitingHour: 600,
    between100And130: 2500,
    maxUpDownKm: 150,
    dropMinKm: 100,
    dropMaxKm: 130,
  },
  "8_5ft": {
    type: "8.5 FT",
    hillExtraPerKm: 10,
    start: 3500,
    extra: 180,
    upDown: 130,
    waiting: 700,
    waitingHour: 700,
    between100And130: 2000,
    maxUpDownKm: 150,
    dropMinKm: 100,
    dropMaxKm: 130,
  },
  "10_5ft": {
    type: "10.5 FT",
    hillExtraPerKm: 10,
    start: 6000,
    extra: 230,
    upDown: 170,
    waiting: 800,
    waitingHour: 800,
    between100And130: 4500,
    maxUpDownKm: 150,
    dropMinKm: 100,
    dropMaxKm: 130,
  },
  "12_5ft": {
    type: "12.5 FT",
    hillExtraPerKm: 10,
    start: 7500,
    extra: 250,
    upDown: 180,
    waiting: 800,
    waitingHour: 800,
    between100And130: 4500,
    maxUpDownKm: 150,
    dropMinKm: 100,
    dropMaxKm: 130,
  },
  "14_5ft": {
    type: "14.5 FT",
    hillExtraPerKm: 10,
    start: 10000,
    extra: 320,
    upDown: 210,
    waiting: 1000,
    waitingHour: 1000,
    between100And130: 7000,
    maxUpDownKm: 150,
    dropMinKm: 100,
    dropMaxKm: 130,
  },
  "16_5ft": {
    type: "16.5 FT",
    hillExtraPerKm: 10,
    start: 11000,
    extra: 330,
    upDown: 220,
    waiting: 1000,
    waitingHour: 1000,
    between100And130: 8000,
    maxUpDownKm: 150,
    dropMinKm: 100,
    dropMaxKm: 130,
  },
  "18_5ft": {
    type: "18.5 FT",
    hillExtraPerKm: 10,
    start: 15000,
    extra: 380,
    upDown: 270,
    waiting: 1200,
    waitingHour: 1200,
    between100And130: 9000,
    maxUpDownKm: 150,
    dropMinKm: 100,
    dropMaxKm: 130,
  },
  "20ft": {
    type: "20 FT",
    hillExtraPerKm: 10,
    start: 18000,
    extra: 450,
    upDown: 300,
    waiting: 1500,
    waitingHour: 1500,
    between100And130: 11000,
    maxUpDownKm: 150,
    dropMinKm: 100,
    dropMaxKm: 130,
  },
};
const fallbackLorryVehicle: VehicleCatalogItem = {
  name: "Agra Lorry",
  category: "Lorries",
  img: "/assets/car.jpg",
  seats: 1,
  acPricePerKm: 0,
  acHillPricePerKm: 0,
  nonAcPricePerKm: 0,
  nonAcHillPricePerKm: 0,
  acAvailable: false,
  nonAcAvailable: false,
  lorryRates: fallbackLorryRates,
};

export function BookingForm() {
  const [vehicleList, setVehicleList] = useState<VehicleCatalogItem[]>(() => getVehicles());
  const [categoryList, setCategoryList] = useState(() => getVehicleCategories());
  const [form, setForm] = useState({
    serviceType: "Passenger",
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
  const [selectedLorryKey, setSelectedLorryKey] = useState<string>("");
  const [lorryCatalog, setLorryCatalog] = useState<VehicleCatalogItem[]>([]);
  const lorrySelectionInitialized = useRef(false);

  const paxCount = Number(form.pax) || 0;
  const passengerVehicles = useMemo(
    () => vehicleList.filter((vehicle) => !vehicle.category.toLowerCase().includes("lorry")),
    [vehicleList],
  );
  const lorryVehicles = useMemo(
    () => lorryCatalog.length ? lorryCatalog : vehicleList.filter((vehicle) => vehicle.category.toLowerCase().includes("lorry")),
    [lorryCatalog, vehicleList],
  );
  const selectedVehicle = vehicleList.length
    ? form.serviceType === "Lorry"
      ? (lorryVehicles.find((vehicle) => vehicle.category.toLowerCase().includes("lorry"))
        || lorryVehicles[0]
        || null)
      : getVehicleByName(form.vehicle, passengerVehicles.length ? passengerVehicles : vehicleList)
    : null;
  const relevantVehicles = useMemo(
    () => passengerVehicles.filter((vehicle) => vehicle.seats >= paxCount),
    [passengerVehicles, paxCount],
  );
  const selectedHillCountry =
    Boolean(pickupPin && classifyHillCountry({}, pickupPin).isHillCountry) ||
    Boolean(destinationPin && classifyHillCountry({}, destinationPin).isHillCountry);
  const selectedPassengerVehicle = form.serviceType === "Passenger" ? selectedVehicle : null;
  const selectedPricePerKm = selectedPassengerVehicle
    ? getPricePerKm(selectedPassengerVehicle, form.ac, form.trip, selectedHillCountry)
    : 0;
  const basePackageCharge = selectedPassengerVehicle
    ? getPackageCharge(selectedPassengerVehicle, Number(form.days) || 1, form.ac, selectedHillCountry)
    : 0;
  const activeLorryVehicle = lorryVehicles.find((vehicle) => vehicle.category.toLowerCase().includes("lorry"))
    || lorryVehicles[0]
    || null;
  const lorryRates = activeLorryVehicle?.lorryRates && Object.keys(activeLorryVehicle.lorryRates).length
    ? activeLorryVehicle.lorryRates
    : fallbackLorryRates;
  const lorryOptions = useMemo(() => {
    const options = Object.entries({
      ...fallbackLorryRates,
      ...(activeLorryVehicle?.lorryRates ?? {}),
    })
      .filter(([, row]) => Boolean(row))
      .map(([key, row]) => [key, { type: String(row.type || key) }] as const);
    if (options.length) return options;
    return Object.entries(fallbackLorryRates).map(([key, row]) => [key, { type: row.type }] as const);
  }, [activeLorryVehicle?.lorryRates]);
  const selectedLorryOptionKey = selectedLorryKey || "";
  const resolvedLorryRate = (() => {
    const active = selectedLorryOptionKey && lorryRates[selectedLorryOptionKey]
      ? lorryRates[selectedLorryOptionKey]
      : Object.values(lorryRates)[0];
    if (active && (active.start > 0 || active.extra > 0 || active.between100And130 > 0)) return active;
    const fallback = fallbackLorryRates["7ft"];
    return fallback;
  })();
  const oneDayPackageDistanceCharge = selectedPassengerVehicle && Number(form.days) === 1
    ? getDayPackageCharge(selectedPassengerVehicle, form.ac, selectedHillCountry)
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
      if (k === "serviceType") {
        const nextServiceType = v === "Lorry" ? "Lorry" : "Passenger";
        const nextVehicle = nextServiceType === "Lorry" ? lorryVehicles[0] : passengerVehicles[0];
        return {
          ...f,
          serviceType: nextServiceType,
          vehicle: nextServiceType === "Lorry" ? "" : (nextVehicle?.name || ""),
          days: nextServiceType === "Lorry" ? "1" : f.days,
        };
      }
      return { ...f, [k]: v };
    });
  }

  useEffect(() => {
    setSummary(null);
  }, [distance]);

  useEffect(() => {
    let cancelled = false;
    const cachedVehicles = getCachedVehiclesFromDatabase();
    const cachedLorries = getCachedLorriesFromDatabase();
    if (cachedVehicles?.length || cachedLorries?.length) {
      setVehicleList([...(cachedVehicles ?? []), ...(cachedLorries ?? [])]);
      if (cachedLorries?.length) setLorryCatalog(cachedLorries);
    }
    async function loadVehicles() {
      let nextVehicles = getVehicles();
      let nextCategories = getVehicleCategories();
      try {
        const [dbVehicles, dbCategories, dbLorries] = await Promise.all([
          getVehiclesFromDatabase(),
          getVehicleCategoriesFromDatabase(),
          getLorriesFromDatabase(),
        ]);
        nextVehicles = [...dbVehicles, ...dbLorries];
        nextCategories = Array.from(new Set([...dbCategories, ...dbLorries.map((item) => item.category)]));
        if (dbLorries.length) setLorryCatalog(dbLorries);
      } catch {
        // Local fallback keeps the inquiry form usable if the backend is offline.
      }
      if (cancelled) return;
      setCategoryList(nextCategories);
      setVehicleList(nextVehicles);
      setLorryCatalog(nextVehicles.filter((vehicle) => vehicle.category.toLowerCase().includes("lorry")));
      setForm((current) => {
        if (nextVehicles.some((vehicle) => vehicle.name === current.vehicle)) return current;
        return { ...current, vehicle: nextVehicles[0]?.name || "" };
      });
      if (!lorrySelectionInitialized.current) {
        const firstLorry = nextVehicles.find((vehicle) => vehicle.category.toLowerCase().includes("lorry"));
        const firstKey = firstLorry ? Object.keys(firstLorry.lorryRates ?? {})[0] : "";
        if (firstKey) {
          setSelectedLorryKey(firstKey);
          lorrySelectionInitialized.current = true;
        }
      }
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

  useEffect(() => {
    if (!selectedPassengerVehicle) return;
    const options = getComfortOptions(selectedPassengerVehicle, form.trip, selectedHillCountry);
    if (options.length === 0) return;
    if (!options.some((option) => option.value === form.ac)) {
      setForm((prev) => ({ ...prev, ac: options[0].value }));
    }
  }, [selectedPassengerVehicle, form.trip, selectedHillCountry, form.ac]);

  useEffect(() => {
    if (form.trip !== "Round Trip") return;
    if (!pickupPin) return;
  }, [form.trip, pickupPin, form.pickup]);

  function validateStep(currentStep: number): boolean {
    const next: typeof errors = {};
    if (currentStep === 0) {
      if (!form.serviceType) next.vehicle = "Choose a vehicle type";
    }
    if (currentStep === 1) {
      if (form.serviceType === "Passenger") {
        if (!form.pax || Number(form.pax) < 1) next.pax = "At least 1 passenger";
        if (!relevantVehicles.length) next.pax = "No vehicle matches this passenger count";
      }
    }
    if (currentStep === 2) {
      if (!pickupPin) next.pickup = "Select pickup";
      if (!destinationPin) next.destination = "Select destination";
    }
    if (currentStep === 3) {
      // Charges step is informational; do not block progression here.
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
    const pricingVehicle = form.serviceType === "Lorry" ? (activeLorryVehicle || fallbackLorryVehicle) : selectedPassengerVehicle;
    if (!pricingVehicle || step !== 4) return;
    if (form.serviceType !== "Lorry") {
      if (!validateStep(2)) return;
      if (!validateStep(3)) return;
    } else if (!validateStep(2)) {
      return;
    }

    const totalKm = distance?.km ?? null;
    const includedKm = Number(form.days || 1) * INCLUDED_KM_PER_DAY;
    const additionalKm = totalKm && totalKm > includedKm ? Number((totalKm - includedKm).toFixed(1)) : 0;
        const billableKm = totalKm ? Math.min(totalKm, includedKm) : 0;
            const includedDistanceCharge = Number(form.days) === 1
                  ? oneDayPackageDistanceCharge || (billableKm && selectedPricePerKm ? billableKm * selectedPricePerKm : 0)
                        : basePackageCharge || (billableKm && selectedPricePerKm ? billableKm * selectedPricePerKm : 0);
                            const additionalDistanceCharge = additionalKm && selectedPricePerKm ? additionalKm * selectedPricePerKm : 0;
                                const package1DayCharge = selectedPricePerKm
                                      ? selectedPricePerKm * INCLUDED_KM_PER_DAY
                                            : oneDayPackageDistanceCharge || 0;
                                                const package1BaseCharge = package1DayCharge * Number(form.days || 1);
                                                    const package1Estimate = totalKm
                                                          ? package1BaseCharge + additionalDistanceCharge
                                                                : null;
                                                                    const package2Estimate = totalKm && selectedPricePerKm
                                                                          ? totalKm * selectedPricePerKm
                                                                                : null;
                                                                                    const activeLorryRate = resolvedLorryRate;
                                                                                        const activeLorryType = activeLorryRate?.type || "7 FT";
                                                                                            const lorryFare = totalKm && activeLorryRate
                                                                                                  ? (() => {
                                                                                                            let fare = 0;
          const isRoundTrip = form.trip === 'round-trip';
          const days = Number(form.days || 1);

          // Determine base rate based on distance
          if (totalKm >= 100 && totalKm <= 130) {
            // Use the "Between 100-130 KM" fixed rate
            fare = activeLorryRate.between100And130;
          } else if (totalKm > 130) {
            // For trips over 130 KM, use per-km rate without standard start fee
            fare = totalKm * activeLorryRate.extra;
          } else {
            // Standard calculation: Start fee + extra KM charges
            fare = activeLorryRate.start;
            const extraKm = Math.max(totalKm - activeLorryRate.dropMinKm, 0);
            fare += extraKm * activeLorryRate.extra;
          }

          // Apply Up & Down rate for round trips (if trip distance should not exceed 150 KM)
          if (isRoundTrip && totalKm <= 150) {
            fare = activeLorryRate.upDown ? totalKm * activeLorryRate.upDown : fare;
          }

          // Add hill surcharge (Rs. 10 per KM for hilly areas)
          const hillSurcharge = selectedHillCountry ? totalKm * activeLorryRate.hillExtraPerKm : 0;
          fare += hillSurcharge;

          // For 1-day trips, return fare as-is. For multi-day, multiply by days
          if (days === 1) {
            return fare;
          } else {
            // For multi-day trips, multiply the base fare by days
            return fare * days;
          }
        })()
      : null;
    const fare = form.serviceType === "Lorry"
      ? lorryFare
      : Number(form.days) === 1
        ? package1Estimate ?? package2Estimate
        : totalKm && selectedPricePerKm
          ? includedDistanceCharge + additionalDistanceCharge
          : null;
    const summaryDays = form.serviceType === "Lorry" ? "1" : form.days;
    setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    setSummary({
      vehicle: form.vehicle,
      serviceType: form.serviceType,
      category: pricingVehicle.category,
      seats: pricingVehicle.seats,
      pickup: form.pickup,
      destination: form.destination,
      pickupHill: pickupPin ? classifyHillCountry({}, pickupPin).isHillCountry : false,
      destinationHill: destinationPin ? classifyHillCountry({}, destinationPin).isHillCountry : false,
      isHillCountry: selectedHillCountry,
      stops: stopLabels.filter(Boolean),
      date: form.date,
      time: form.time,
      days: summaryDays,
      trip: form.trip,
      pax: form.pax,
      ac: form.ac,
      pricePerKm: form.serviceType === "Lorry" ? (activeLorryRate?.extra ?? fallbackLorryRates["7ft"].extra) : selectedPricePerKm,
      effectivePricePerKm: form.serviceType === "Lorry" ? (activeLorryRate?.extra ?? fallbackLorryRates["7ft"].extra) : selectedPricePerKm,
      includedKm,
      additionalKm,
      billableKm,
      includedDistanceCharge: form.serviceType === "Lorry" ? (activeLorryRate?.start ?? fallbackLorryRates["7ft"].start) : includedDistanceCharge,
      additionalDistanceCharge: form.serviceType === "Lorry" ? (activeLorryRate?.extra ?? fallbackLorryRates["7ft"].extra) * (totalKm ?? 0) : additionalDistanceCharge,
      basePackageCharge: form.serviceType === "Lorry" ? (activeLorryRate?.start ?? fallbackLorryRates["7ft"].start) : package1BaseCharge,
      oneDayPackageDistanceCharge,
      package1Estimate,
      package2Estimate,
      distanceKm: totalKm,
      estimatedFare: fare,
      pickupPin,
      destinationPin,
      distanceSource: distance?.source,
      lorryType: activeLorryType,
    });
  }

  function reserveOnWhatsApp() {
    const pricingVehicle = summary?.serviceType === "Lorry" ? (activeLorryVehicle || fallbackLorryVehicle) : selectedPassengerVehicle;
    if (!summary || !pricingVehicle) return;

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

    const tripRouteText =
      summary.trip === "Round Trip"
        ? `${summary.pickup || "pickup"} to ${summary.destination || "drop"} and back to ${summary.pickup || "pickup"}`
        : `${summary.pickup || "pickup"} to ${summary.destination || "destination"}`;

    const msg = `Ayubowan. Welcome to Agra Taxis.

*New Booking Inquiry*
Vehicle: ${summary.vehicle}
Category: ${summary.category}
Seats: ${summary.seats}
Pickup: ${summary.pickup}${summary.stops.length ? "\n" + summary.stops.map((s, i) => `Stop ${i + 1}: ${s}`).join("\n") : ""}
${summary.trip === "Round Trip" ? `Route: ${tripRouteText}` : `Destination: ${summary.destination}`}
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
Per km rate: ${summary.pricePerKm ? formatLkr(summary.pricePerKm) : "N/A"}
Estimated Fare: ${summary.estimatedFare ? formatLkr(summary.estimatedFare) : "Not calculated"}
${Number(summary.days) === 1 ? `Package 1 estimate: ${summary.package1Estimate != null ? formatLkr(summary.package1Estimate) : "Not available"}\nPackage 2 estimate: ${summary.package2Estimate != null ? formatLkr(summary.package2Estimate) : "Not available"}` : ""}
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
                    <button
                      type="button"
                      onClick={() => update("serviceType", "Passenger")}
                      className={`border px-4 py-4 text-left transition ${
                        form.serviceType === "Passenger" ? "border-gold bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/70"
                      }`}
                    >
                      <p className="text-sm font-semibold">Passenger vehicle</p>
                      <p className="mt-1 text-xs text-white/45">Cars, vans, SUVs, minibuses, and buses.</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => update("serviceType", "Lorry")}
                      className={`border px-4 py-4 text-left transition ${
                        form.serviceType === "Lorry" ? "border-gold bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/70"
                      }`}
                    >
                      <p className="text-sm font-semibold">Lorry</p>
                      <p className="mt-1 text-xs text-white/45">Use the separate lorry rate table and rules.</p>
                    </button>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="step-1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                      <CheckCircle2 className="h-4 w-4 text-gold" />
                      {form.serviceType === "Lorry"
                        ? "Lorry bookings use the lorry rate table and do not depend on passenger count."
                        : "Passenger count narrows the vehicle list before route pricing starts."}
                    </div>
                    {form.serviceType === "Passenger" ? (
                      <div className="grid gap-5 sm:grid-cols-2">
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
                      </div>
                    ) : (
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Lorry Type">
                          <select
                            value={selectedLorryOptionKey}
                            onChange={(e) => setSelectedLorryKey(e.target.value)}
                            className={inputCls()}
                          >
                            {lorryOptions.map(([key, row]) => (
                              <option
                                key={key}
                                value={key}
                                className={key === selectedLorryOptionKey ? "text-red-600 font-semibold" : undefined}
                              >
                                {String((row as { type?: string }).type || key.replace(/_/g, " ").toUpperCase())}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <div className="border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                          Lorry pricing and limits are loaded from the selected lorry type. The route and distance steps still apply.
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step-2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Trip Type">
                        <select value={form.trip} onChange={(e) => update("trip", e.target.value)} className={inputCls()}>
                          <option>One Way</option>
                          <option>Round Trip</option>
                        </select>
                      </Field>
                      <Field label="Travel Date (Optional)" error={errors.date}>
                        <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className={inputCls("date")} />
                      </Field>
                      <Field label="Travel Time (Optional)">
                        <input type="time" value={form.time} onChange={(e) => update("time", e.target.value)} className={inputCls()} />
                      </Field>
                      {form.serviceType === "Passenger" ? (
                        <Field label="Number of Days" error={errors.days}>
                          <input type="number" min={1} value={form.days} onChange={(e) => update("days", e.target.value)} className={inputCls("days")} />
                        </Field>
                      ) : (
                        <Field label="Number of Days">
                          <input type="text" value="1 day fixed" readOnly className={inputCls()} />
                        </Field>
                      )}
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

                {step === 3 && (
                  <motion.div key="step-3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-5 sm:grid-cols-2">
                    {form.serviceType === "Lorry" ? (
                      <div className="sm:col-span-2 space-y-3">
                        <div className="border border-white/10 bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/60">
                          Lorry pricing uses a separate rate table. Start, extra, up/down, waiting, waiting hour, and between-100-130 km are shown below.
                        </div>
                        <LorryRateTable
                          rates={lorryRates && Object.keys(lorryRates).length ? lorryRates : fallbackLorryRates}
                          selectedKey={selectedLorryOptionKey}
                        />
                      </div>
                    ) : (
                      <>
                        <Field label="AC / Non AC">
                          <select disabled={!selectedVehicle} value={form.ac} onChange={(e) => update("ac", e.target.value)} className={inputCls()}>
                            {getComfortOptions(selectedVehicle, form.trip, selectedHillCountry).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <SummaryRow label="Route type" value={selectedHillCountry ? "Hill country" : "Normal"} />
                          <SummaryRow label="Charge per km" value={selectedPricePerKm ? formatLkr(selectedPricePerKm) : "N/A"} />
                          <SummaryRow label="Package charge" value={basePackageCharge ? formatLkr(basePackageCharge) : "Per-km only"} />
                          <SummaryRow label="Included km per package" value={`${INCLUDED_KM_PER_DAY} km`} />
                        </div>
                        <div className="sm:col-span-2 border border-white/10 bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/60">
                          Charges are selected after route detection. Hill-country pricing is used when either pickup or destination is detected as hill country.
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {step === 4 && form.serviceType === "Passenger" && (
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
                        <SummaryRow label="Included km per package" value={`${INCLUDED_KM_PER_DAY} km`} />
                      </div>
                      {Number(form.days) > 1 && (
                        <div className="border border-white/10 bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/60">
                          This trip includes {Number(form.days) * INCLUDED_KM_PER_DAY} km total ({form.days} day{Number(form.days) === 1 ? "" : "s"} x {INCLUDED_KM_PER_DAY} km). Extra distance is charged per km when the trip goes beyond that limit.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 4 && form.serviceType === "Lorry" && (
                  <motion.div key="step-4-lorry" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <div className="space-y-4">
                      <div className="border border-white/10 bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/60">
                        Lorry bookings are priced from the vehicle-specific rate table. The summary below shows the active rates for this vehicle.
                      </div>
                      <LorryRateTable
                        rates={lorryRates && Object.keys(lorryRates).length ? lorryRates : fallbackLorryRates}
                        selectedKey={selectedLorryOptionKey}
                      />
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
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      goNext();
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-gold px-5 py-3 text-sm font-black uppercase tracking-widest text-charcoal shadow-gold transition-all hover:brightness-110"
                  >
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

              {summary.serviceType === "Lorry" ? (
                <div className="space-y-4">
                  <p className="text-base leading-7 text-white/80">
                    Your lorry fare is calculated from the selected type and the route distance.
                    The base fare covers the starting range, then extra distance is charged per km.
                    If the route is in hill country, the hill surcharge is added for each km.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SummaryRow label="Lorry type" value={summary.lorryType || "7 FT"} />
                    <SummaryRow label="Distance" value={summary.distanceKm ? `${summary.distanceKm} km` : "Not calculated"} />
                    <SummaryRow label="Base fare" value={summary.basePackageCharge ? formatLkr(summary.basePackageCharge) : "N/A"} />
                    <SummaryRow label="Extra/km" value={summary.effectivePricePerKm ? formatLkr(summary.effectivePricePerKm) : "N/A"} />
                  </div>
                  <div className="border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-sm font-semibold text-white">Estimated lorry fare</p>
                    <p className="mt-1 text-lg font-bold text-gold">
                      {summary.estimatedFare ? formatLkr(summary.estimatedFare) : "Not available"}
                    </p>
                    <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-xs text-white/60">
                      {summary.distanceKm ? (
                        <>
                          <p><span className="font-semibold">Distance:</span> {summary.distanceKm} km</p>
                          {summary.distanceKm > 130 ? (
                            <>
                              <p><span className="font-semibold">Base rate:</span> {summary.distanceKm} km @ {summary.effectivePricePerKm ? formatLkr(summary.effectivePricePerKm) : "N/A"}/km = {summary.effectivePricePerKm ? formatLkr(summary.distanceKm * summary.effectivePricePerKm) : "N/A"}</p>
                            </>
                          ) : (
                            <>
                              <p><span className="font-semibold">Start fee:</span> {summary.basePackageCharge ? formatLkr(summary.basePackageCharge) : "N/A"}</p>
                              <p><span className="font-semibold">Extra km:</span> {summary.distanceKm > 10 ? summary.distanceKm - 10 : 0} km @ {summary.effectivePricePerKm ? formatLkr(summary.effectivePricePerKm) : "N/A"}/km = {summary.distanceKm > 10 ? formatLkr((summary.distanceKm - 10) * (summary.effectivePricePerKm || 0)) : "Rs. 0"}</p>
                            </>
                          )}
                          {summary.isHillCountry && <p><span className="font-semibold">Hill surcharge:</span> {summary.distanceKm} km × Rs. 10/km = {formatLkr(summary.distanceKm * 10)}</p>}
                          {Number(summary.days) > 1 && <p><span className="font-semibold">Days:</span> × {summary.days} days</p>}
                        </>
                      ) : (
                        <p>Add pickup and destination to calculate the lorry fare.</p>
                      )}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-amber-300">
                      Final pricing may vary based on actual route, waiting time, and road conditions.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-base leading-7 text-white/80">
                    Your trip is calculated based on the total distance travelled. Package 1 includes{" "}
                    <span className="font-semibold text-white">{INCLUDED_KM_PER_DAY} km per day</span>.
                    For{" "}
                    <span className="font-semibold text-white">{summary.days}</span>
                    {" "}day{Number(summary.days) === 1 ? "" : "s"}, the included distance is{" "}
                    <span className="font-semibold text-white">{Number(summary.days) * INCLUDED_KM_PER_DAY} km</span>
                    .
                  </p>

                  <div className="space-y-3">
                    {summary.distanceKm && summary.distanceKm <= (Number(summary.days) * INCLUDED_KM_PER_DAY) && (
                      <div className="border border-white/10 bg-white/5 px-4 py-3">
                        <p className="text-sm font-semibold text-white">Package 1 - day package</p>
                        <p className="mt-1 text-lg font-bold text-gold">
                          {summary.package1Estimate != null ? formatLkr(summary.package1Estimate) : "Not available"}
                        </p>
                        <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-xs text-white/60">
                          <p><span className="font-semibold">Distance:</span> {summary.distanceKm ? `${summary.distanceKm} km` : "Not calculated"}</p>
                          <p><span className="font-semibold">Daily package:</span> {INCLUDED_KM_PER_DAY} km @ {summary.pricePerKm ? formatLkr(summary.pricePerKm) : "N/A"}/km = {summary.pricePerKm ? formatLkr(INCLUDED_KM_PER_DAY * summary.pricePerKm) : "N/A"}</p>
                          {summary.days && Number(summary.days) > 1 && <p><span className="font-semibold">Days:</span> × {summary.days} days = {summary.pricePerKm ? formatLkr(INCLUDED_KM_PER_DAY * summary.pricePerKm * Number(summary.days)) : "N/A"}</p>}
                          {summary.additionalKm > 0 && <p><span className="font-semibold">Extra km:</span> {summary.additionalKm} km @ {summary.pricePerKm ? formatLkr(summary.pricePerKm) : "N/A"}/km = {summary.pricePerKm ? formatLkr(summary.additionalKm * summary.pricePerKm) : "N/A"}</p>}
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-white/45">
                          Package 1 includes {INCLUDED_KM_PER_DAY} km per day. If the trip exceeds this, extra distance is charged per km.
                        </p>
                      </div>
                    )}

                    {Number(summary.days) === 1 && (
                      <div className="border border-white/10 bg-white/5 px-4 py-3">
                        <p className="text-sm font-semibold text-white">Package 2 - distance based</p>
                        <p className="mt-1 text-lg font-bold text-gold">
                          {summary.package2Estimate != null ? formatLkr(summary.package2Estimate) : "Not available"}
                        </p>
                        <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-xs text-white/60">
                          <p><span className="font-semibold">Distance:</span> {summary.distanceKm ? `${summary.distanceKm} km` : "Not calculated"}</p>
                          <p><span className="font-semibold">Distance-based rate:</span> {summary.distanceKm && summary.pricePerKm ? `${summary.distanceKm} km @ ${formatLkr(summary.pricePerKm)}/km = ${formatLkr(summary.distanceKm * summary.pricePerKm)}` : "Not calculated"}</p>
                          {summary.includedKm > 0 && <p><span className="font-semibold">Included distance:</span> {summary.includedKm} km (no extra charge)</p>}
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-white/45">
                          Calculated based on total distance traveled. Includes the first {INCLUDED_KM_PER_DAY} km at the selected per-km rate.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <p className="mt-3 text-xs leading-relaxed text-white/45">
                This is an estimate only. Final pricing may change based on route conditions, stops, waiting time, the actual trip duration, and the final per-km billing after the included allowance.
              </p>

              {!summary.distanceKm && <p className="mt-3 text-xs text-amber-400">Add pickup and destination for the fare estimate.</p>}

              <button type="button" onClick={reserveOnWhatsApp} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-whatsapp py-4 text-sm font-bold uppercase tracking-wider text-white shadow-card transition-all hover:bg-whatsapp/90">
                <WhatsAppIcon className="h-5 w-5" />
                Reserve on WhatsApp
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {summary && summary.serviceType !== "Lorry" && Number(summary.days) > 1 && (
          <p className="mt-3 px-1 text-xs leading-relaxed text-white/45">
            Price chart: each package includes up to {INCLUDED_KM_PER_DAY} km. For {summary.days} day{Number(summary.days) === 1 ? "" : "s"}, the total included limit is {Number(summary.days) * INCLUDED_KM_PER_DAY} km, and additional charges may apply per km after that.
          </p>
        )}
      </div>
    </section>
  );
}

function getComfortOptions(
  vehicle: VehicleCatalogItem | null,
  trip: string,
  isHillCountry: boolean,
) {
  if (!vehicle) return [];

  const options = [
    vehicle.acAvailable
      ? {
          value: "AC",
          label: `AC - ${formatLkr(getPricePerKm(vehicle, "AC", trip, isHillCountry))} / km`,
          price: getPricePerKm(vehicle, "AC", trip, isHillCountry),
        }
      : null,
    vehicle.nonAcAvailable
      ? {
          value: "Non AC",
          label: `Non AC - ${formatLkr(getPricePerKm(vehicle, "Non AC", trip, isHillCountry))} / km`,
          price: getPricePerKm(vehicle, "Non AC", trip, isHillCountry),
        }
      : null,
  ].filter((option): option is { value: string; label: string; price: number } => Boolean(option));

  return options.filter((option) => option.price > 0);
}

function getPackageCharge(vehicle: VehicleCatalogItem, days: number, ac: string, isHillCountry: boolean) {
  const dayKey = `day${Math.max(1, Math.floor(days))}`;
  const packageRow = vehicle.package1Prices?.[dayKey];
  if (!packageRow) return 0;
  if (ac === "Non AC") return isHillCountry ? packageRow.nonAcHill : packageRow.nonAcNormal;
  return isHillCountry ? packageRow.acHill : packageRow.acNormal;
}

function getDayPackageCharge(vehicle: VehicleCatalogItem, ac: string, isHillCountry: boolean) {
  const packageRow = vehicle.package1Prices?.day1;
  if (!packageRow) return 0;
  if (ac === "Non AC") return isHillCountry ? packageRow.nonAcHill : packageRow.nonAcNormal;
  return isHillCountry ? packageRow.acHill : packageRow.acNormal;
}

function LorryRateTable({ rates, selectedKey }: { rates: LorryRates; selectedKey?: string }) {
  const rows = Object.values(rates).filter((row) =>
    row.start > 0 || row.extra > 0 || row.upDown > 0 || row.waiting > 0 || row.waitingHour > 0 || row.between100And130 > 0,
  );

  if (!rows.length) {
    return (
      <div className="border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
        No lorry rate table has been configured for this vehicle.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-white/10 bg-white/5">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 text-[10px] uppercase tracking-wider text-white/50">
          <tr>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Start</th>
            <th className="px-4 py-2">Extra</th>
            <th className="px-4 py-2">Up &amp; Down</th>
            <th className="px-4 py-2">Waiting</th>
            <th className="px-4 py-2">Waiting Hour</th>
            <th className="px-4 py-2">Between 100-130 KM</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rowKey = Object.entries(rates).find(([, value]) => value === row)?.[0];
            const isSelected = rowKey === selectedKey;
            return (
            <tr key={row.type} className={`border-t border-white/10 ${isSelected ? "bg-red-500/10" : ""}`}>
              <td className={`px-4 py-2 font-semibold ${isSelected ? "text-red-300" : "text-white"}`}>{row.type}</td>
              <td className="px-4 py-2 text-white/80">{formatLkr(row.start)}</td>
              <td className="px-4 py-2 text-white/80">{formatLkr(row.extra)}</td>
              <td className="px-4 py-2 text-white/80">{formatLkr(row.upDown)}</td>
              <td className="px-4 py-2 text-white/80">{formatLkr(row.waiting)}</td>
              <td className="px-4 py-2 text-white/80">{formatLkr(row.waitingHour)}</td>
              <td className="px-4 py-2 text-white/80">{formatLkr(row.between100And130)}</td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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
