import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Compass, Eye, Snowflake, UserCheck, Users, Wifi, X } from "lucide-react";
import {
  formatLkr,
  getVehicleCategories,
  getVehicleCategoriesFromDatabase,
  getCachedLorriesFromDatabase,
  getCachedVehiclesFromDatabase,
  getVehicles,
  getVehiclesFromDatabase,
  getLorriesFromDatabase,
  type VehicleCatalogItem,
  type VehicleCategory,
} from "@/lib/vehicle-catalog";

type Category = "All" | VehicleCategory;

export function Fleet() {
  const [active, setActive] = useState<Category>("All");
  const [categoryList, setCategoryList] = useState<Category[]>(() => getVehicleCategories());
  const [vehicleList, setVehicleList] = useState<VehicleCatalogItem[]>(() => getVehicles());
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleCatalogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const filtered = active === "All" ? vehicleList : vehicleList.filter((f) => f.category === active);

  useEffect(() => {
    let cancelled = false;
    const cachedVehicles = getCachedVehiclesFromDatabase();
    const cachedLorries = getCachedLorriesFromDatabase();
    if (cachedVehicles?.length) setVehicleList(cachedVehicles);
    if (cachedLorries?.length) {
      setVehicleList((current) => {
        const byName = new Map(current.map((item) => [item.name, item]));
        cachedLorries.forEach((item) => byName.set(item.name, item));
        return Array.from(byName.values());
      });
    }
    async function loadVehicles() {
      try {
        const [vehicles, categories, lorries] = await Promise.all([
          getVehiclesFromDatabase(),
          getVehicleCategoriesFromDatabase(),
          getLorriesFromDatabase(),
        ]);
        if (cancelled) return;
        setVehicleList([...vehicles, ...lorries]);
        setCategoryList(Array.from(new Set([...categories, ...lorries.map((item) => item.category)])) as Category[]);
      } catch {
        if (cancelled) return;
        setVehicleList([...getVehicles(), ...[]]);
        setCategoryList(getVehicleCategories());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadVehicles();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="fleet" className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-3">
            <span className="h-px w-6 bg-gold" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Our Vehicles</span>
            <span className="h-px w-6 bg-gold" />
          </div>
          <h2 className="mt-5 text-balance text-3xl font-bold leading-tight tracking-tight text-charcoal sm:text-4xl lg:text-5xl">
            Premium Vehicles for Every Need
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground lg:text-lg">
            Choose by category, seats, comfort type, and per-kilometer rate.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2.5">
          {categoryList.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                active === c
                  ? "border-charcoal bg-charcoal text-white shadow-card"
                  : "border-border bg-white text-charcoal/70 hover:border-charcoal/30 hover:text-charcoal"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft"
                >
                  <div className="aspect-16/10 bg-secondary" />
                  <div className="space-y-4 p-5">
                    <div className="h-6 w-3/4 rounded bg-secondary" />
                    <div className="flex flex-wrap gap-1.5">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-6 w-16 rounded-full bg-secondary" />
                      ))}
                    </div>
                    <div className="h-20 rounded-xl bg-secondary" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-10 rounded-xl bg-secondary" />
                      <div className="h-10 rounded-xl bg-secondary" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          ) : (
            <>
              {filtered.map((v, i) => (
            <motion.div
              key={v.name}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
              onClick={() => navigate("/booking")}
              role="button"
              tabIndex={0}
            >
              <div className="relative aspect-16/10 overflow-hidden bg-secondary">
                <img
                  src={v.img}
                  alt={v.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-charcoal/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  {v.category}
                </span>
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/20 bg-charcoal/80 px-2.5 py-1 backdrop-blur-sm">
                  <Users className="h-3 w-3 text-white/70" />
                  <span className="text-[10px] font-bold text-white">{v.seats}</span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-charcoal">{v.name}</h3>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[
                    { icon: UserCheck, label: "Chauffeur" },
                    ...(v.acAvailable ? [{ icon: Snowflake, label: "AC" }] : []),
                    { icon: Wifi, label: "WiFi" },
                    { icon: Compass, label: "GPS" },
                  ].map(({ icon: Icon, label }) => (
                    <span key={label} className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Icon className="h-2.5 w-2.5 text-gold" /> {label}
                    </span>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-border bg-[#f8f9fb] px-3 py-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">From / km</p>
                  <p className="mt-0.5 text-sm font-bold text-charcoal">
                    {(() => {
                      const rates = [
                        v.acAvailable ? v.acPricePerKm : null,
                        v.acAvailable ? v.acHillPricePerKm : null,
                        v.nonAcAvailable ? v.nonAcPricePerKm : null,
                        v.nonAcAvailable ? v.nonAcHillPricePerKm : null,
                        v.perKmPrices?.ac.oneWay.normal ?? null,
                        v.perKmPrices?.ac.oneWay.hill ?? null,
                        v.perKmPrices?.ac.roundTrip.normal ?? null,
                        v.perKmPrices?.ac.roundTrip.hill ?? null,
                        v.perKmPrices?.nonAc.oneWay.normal ?? null,
                        v.perKmPrices?.nonAc.oneWay.hill ?? null,
                        v.perKmPrices?.nonAc.roundTrip.normal ?? null,
                        v.perKmPrices?.nonAc.roundTrip.hill ?? null,
                      ].filter((value): value is number => typeof value === "number" && value > 0);
                      return rates.length ? formatLkr(Math.min(...rates)) : "—";
                    })()}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground/70">
                    Lowest available rate shown.
                  </p>
                </div>

                {v.stayPrices && (
                  <div className="mt-3 rounded-xl border border-border bg-[#f8f9fb] p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Daily Stay Charges</p>
                    <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
                      {([1, 2, 3, 4, 5] as const).map((d) => (
                        <div key={d} className="rounded-lg bg-white py-1.5 shadow-soft">
                          <div className="font-bold text-gold">D{d}</div>
                          <div className="mt-0.5 text-charcoal">{formatLkr(v.stayPrices![`day${d}` as keyof typeof v.stayPrices])}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground/70">
                  Rates are estimates. Final price confirmed per route and requirements.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVehicle(v);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white py-3 text-sm font-bold text-charcoal transition-all duration-200 hover:border-charcoal/30"
                  >
                    <Eye className="h-4 w-4" />
                    Full View
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/booking");
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal py-3 text-sm font-bold text-white shadow-card transition-all duration-200 hover:bg-charcoal/90"
                  >
                    Estimate
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </motion.div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full mt-16 text-center text-sm text-muted-foreground">
                  No vehicles in this category yet.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedVehicle && (
        <VehicleFullView vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
      )}
    </section>
  );
}

function VehicleFullView({ vehicle, onClose }: { vehicle: VehicleCatalogItem; onClose: () => void }) {
  const gallery = (vehicle.images?.length ? vehicle.images : [vehicle.img, vehicle.img2, vehicle.img3, vehicle.img4, vehicle.img5].filter(Boolean)) as string[];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-card">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">{vehicle.category}</p>
            <h3 className="text-xl font-bold text-charcoal">{vehicle.name}</h3>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-charcoal hover:bg-secondary" aria-label="Close vehicle details">
            <X className="h-5 w-5" />
          </button>
        </div>

          <div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
              <button type="button" className="overflow-hidden rounded-lg bg-secondary text-left" onClick={() => setSelectedImage(vehicle.img)}>
                <img src={vehicle.img} alt={vehicle.name} className="aspect-16/10 h-full w-full object-cover" />
              </button>
              <div className="grid grid-cols-2 gap-3">
                {gallery.slice(1, 5).map((image, index) => (
                  <button key={`${vehicle.name}-${index}`} type="button" className="overflow-hidden rounded-lg bg-secondary text-left" onClick={() => setSelectedImage(image)}>
                    <img src={image} alt={`${vehicle.name} view ${index + 2}`} className="aspect-16/10 h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <DetailTile label="Seats" value={`${vehicle.seats}`} />
              <DetailTile label="Comfort" value={[vehicle.acAvailable && "AC", vehicle.nonAcAvailable && "Non-AC"].filter(Boolean).join(" / ") || "N/A"} />
            </div>

            <div className="rounded-lg border border-border">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-bold text-charcoal">Per-kilometer charges</p>
              </div>
              <RateTable vehicle={vehicle} />
            </div>

            {vehicle.package1Prices && (
              <div className="rounded-lg border border-border">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-bold text-charcoal">Package day charges</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Packages include 150 km per day. Extra distance uses the selected per-km charge.</p>
                </div>
                <PackageTable vehicle={vehicle} />
              </div>
            )}

            {vehicle.lorryRates && Object.keys(vehicle.lorryRates).length > 0 && (
              <div className="rounded-lg border border-border">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-bold text-charcoal">Lorry rate table</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Start, extra, up/down, waiting, waiting hour, and between 100-130 km rates.</p>
                </div>
                <LorryRateTable rates={vehicle.lorryRates} />
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedImage && (
        <button type="button" onClick={() => setSelectedImage(null)} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <img src={selectedImage} alt={`${vehicle.name} full view`} className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain shadow-card" />
        </button>
      )}
    </div>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/60 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-charcoal">{value}</p>
    </div>
  );
}

function RateTable({ vehicle }: { vehicle: VehicleCatalogItem }) {
  const rates = vehicle.perKmPrices;
  const rows = [
    ["AC", "One way", rates?.ac.oneWay.normal ?? vehicle.acPricePerKm, rates?.ac.oneWay.hill ?? vehicle.acHillPricePerKm, vehicle.acAvailable],
    ["AC", "Round trip", rates?.ac.roundTrip.normal ?? vehicle.acPricePerKm, rates?.ac.roundTrip.hill ?? vehicle.acHillPricePerKm, vehicle.acAvailable],
    ["Non-AC", "One way", rates?.nonAc.oneWay.normal ?? vehicle.nonAcPricePerKm, rates?.nonAc.oneWay.hill ?? vehicle.nonAcHillPricePerKm, vehicle.nonAcAvailable],
    ["Non-AC", "Round trip", rates?.nonAc.roundTrip.normal ?? vehicle.nonAcPricePerKm, rates?.nonAc.roundTrip.hill ?? vehicle.nonAcHillPricePerKm, vehicle.nonAcAvailable],
  ] as const;
  const visibleRows = rows.filter(([, , normal, hill, available]) => available && (normal > 0 || hill > 0));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-secondary/70 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Trip</th>
            <th className="px-4 py-2">Normal</th>
            <th className="px-4 py-2">Hill</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.length > 0 ? visibleRows.map(([type, trip, normal, hill]) => (
            <tr key={`${type}-${trip}`} className="border-t border-border">
              <td className="px-4 py-2 font-semibold text-charcoal">{type}</td>
              <td className="px-4 py-2 text-muted-foreground">{trip}</td>
              <td className="px-4 py-2">{normal > 0 ? formatLkr(normal) : "—"}</td>
              <td className="px-4 py-2">{hill > 0 ? formatLkr(hill) : "—"}</td>
            </tr>
          )) : (
            <tr>
              <td className="px-4 py-3 text-sm text-muted-foreground" colSpan={4}>
                No active per-kilometer rates available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PackageTable({ vehicle }: { vehicle: VehicleCatalogItem }) {
  const rows = Object.entries(vehicle.package1Prices || {}).sort(
    ([a], [b]) => Number(a.replace("day", "")) - Number(b.replace("day", "")),
  );
  const visibleRows = rows.filter(([, prices]) => {
    const hasAc = vehicle.acAvailable && (prices.acNormal > 0 || prices.acHill > 0);
    const hasNonAc = vehicle.nonAcAvailable && (prices.nonAcNormal > 0 || prices.nonAcHill > 0);
    return hasAc || hasNonAc;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-secondary/70 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-2">Day</th>
            {vehicle.acAvailable && <th className="px-4 py-2">AC normal</th>}
            {vehicle.acAvailable && <th className="px-4 py-2">AC hill</th>}
            {vehicle.nonAcAvailable && <th className="px-4 py-2">Non-AC normal</th>}
            {vehicle.nonAcAvailable && <th className="px-4 py-2">Non-AC hill</th>}
          </tr>
        </thead>
        <tbody>
          {visibleRows.length > 0 ? visibleRows.map(([day, prices]) => (
            <tr key={day} className="border-t border-border">
              <td className="px-4 py-2 font-semibold text-charcoal">{day.replace("day", "Day ")}</td>
              {vehicle.acAvailable && <td className="px-4 py-2">{prices.acNormal > 0 ? formatLkr(prices.acNormal) : "—"}</td>}
              {vehicle.acAvailable && <td className="px-4 py-2">{prices.acHill > 0 ? formatLkr(prices.acHill) : "—"}</td>}
              {vehicle.nonAcAvailable && <td className="px-4 py-2">{prices.nonAcNormal > 0 ? formatLkr(prices.nonAcNormal) : "—"}</td>}
              {vehicle.nonAcAvailable && <td className="px-4 py-2">{prices.nonAcHill > 0 ? formatLkr(prices.nonAcHill) : "—"}</td>}
            </tr>
          )) : (
            <tr>
              <td className="px-4 py-3 text-sm text-muted-foreground" colSpan={1 + Number(vehicle.acAvailable) * 2 + Number(vehicle.nonAcAvailable) * 2}>
                No active package day charges available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function LorryRateTable({ rates }: { rates: NonNullable<VehicleCatalogItem["lorryRates"]> }) {
  const rows = Object.values(rates).filter((row) =>
    row.hillExtraPerKm > 0 ||
    row.start > 0 ||
    row.extra > 0 ||
    row.upDown > 0 ||
    row.waiting > 0 ||
    row.waitingHour > 0 ||
    row.between100And130 > 0 ||
    row.maxUpDownKm > 0 ||
    row.dropMinKm > 0 ||
    row.dropMaxKm > 0,
  );

  if (!rows.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-secondary/70 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Hill / KM</th>
            <th className="px-4 py-2">Start</th>
            <th className="px-4 py-2">Extra</th>
            <th className="px-4 py-2">Up &amp; Down</th>
            <th className="px-4 py-2">Waiting</th>
            <th className="px-4 py-2">Waiting Hour</th>
            <th className="px-4 py-2">Between 100-130 KM</th>
            <th className="px-4 py-2">Up/Down Limit</th>
            <th className="px-4 py-2">Drop Min</th>
            <th className="px-4 py-2">Drop Max</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.type} className="border-t border-border">
              <td className="px-4 py-2 font-semibold text-charcoal">{row.type}</td>
              <td className="px-4 py-2">{formatLkr(row.hillExtraPerKm)}</td>
              <td className="px-4 py-2">{formatLkr(row.start)}</td>
              <td className="px-4 py-2">{formatLkr(row.extra)}</td>
              <td className="px-4 py-2">{formatLkr(row.upDown)}</td>
              <td className="px-4 py-2">{formatLkr(row.waiting)}</td>
              <td className="px-4 py-2">{formatLkr(row.waitingHour)}</td>
              <td className="px-4 py-2">{formatLkr(row.between100And130)}</td>
              <td className="px-4 py-2">{row.maxUpDownKm > 0 ? `${row.maxUpDownKm} km` : "—"}</td>
              <td className="px-4 py-2">{row.dropMinKm > 0 ? `${row.dropMinKm} km` : "—"}</td>
              <td className="px-4 py-2">{row.dropMaxKm > 0 ? `${row.dropMaxKm} km` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
