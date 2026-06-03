import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Snowflake, Wifi, Compass, UserCheck, ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { waLink } from "@/lib/contact";
import {
  formatLkr,
  getVehicleCategories,
  getVehicleCategoriesFromDatabase,
  getVehicles,
  getVehiclesFromDatabase,
  type VehicleCatalogItem,
  type VehicleCategory,
} from "@/lib/vehicle-catalog";

type Category = "All" | VehicleCategory;

export function Fleet() {
  const [active, setActive] = useState<Category>("All");
  const [categoryList, setCategoryList] = useState<Category[]>(() => getVehicleCategories());
  const [vehicleList, setVehicleList] = useState<VehicleCatalogItem[]>(() => getVehicles());
  const filtered = active === "All" ? vehicleList : vehicleList.filter((f) => f.category === active);

  useEffect(() => {
    let cancelled = false;
    async function loadVehicles() {
      try {
        const [vehicles, categories] = await Promise.all([
          getVehiclesFromDatabase(),
          getVehicleCategoriesFromDatabase(),
        ]);
        if (cancelled) return;
        setVehicleList(vehicles);
        setCategoryList(categories);
      } catch {
        if (cancelled) return;
        setVehicleList(getVehicles());
        setCategoryList(getVehicleCategories());
      }
    }
    void loadVehicles();
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="fleet" className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
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

        {/* Category filters */}
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

        {/* Vehicle grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v, i) => (
            <motion.div
              key={v.name}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
            >
              {/* Image */}
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

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-charcoal">{v.name}</h3>

                {/* Amenity badges */}
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

                {/* Pricing */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-border bg-[#f8f9fb] px-3 py-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">AC / km</p>
                    <p className="mt-0.5 text-sm font-bold text-charcoal">
                      {v.acAvailable ? formatLkr(v.acPricePerKm) : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-[#f8f9fb] px-3 py-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Non-AC / km</p>
                    <p className="mt-0.5 text-sm font-bold text-charcoal">
                      {v.nonAcAvailable ? formatLkr(v.nonAcPricePerKm) : "—"}
                    </p>
                  </div>
                </div>

                {/* Stay charges */}
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

                {/* CTA */}
                <a
                  href={waLink(`Hi, I'd like a price inquiry for the ${v.name} (${v.seats} seats).`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-charcoal py-3 text-sm font-bold text-white shadow-card transition-all duration-200 hover:bg-charcoal/90"
                >
                  <WhatsAppIcon className="h-4 w-4 text-whatsapp" />
                  Price Inquiry
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center text-sm text-muted-foreground">
            No vehicles in this category yet.
          </div>
        )}
      </div>
    </section>
  );
}
