import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BadgeDollarSign, Info, Snowflake, Users, Wifi, Compass, UserCheck } from "lucide-react";
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
  const filtered =
    active === "All" ? vehicleList : vehicleList.filter((f) => f.category === active);

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
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="fleet" className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-gold font-semibold uppercase tracking-wider text-sm">
            Our Vehicles
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal text-balance">
            Premium Vehicles for Every Need
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Choose by category, seats, comfort type, and per-kilometer rate.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {categoryList.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border cursor-pointer ${
                active === c
                  ? "bg-gold text-gold-foreground border-gold shadow-soft"
                  : "bg-white text-charcoal border-border hover:bg-secondary hover:border-charcoal/20"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((v, i) => (
            <motion.div
              key={v.name}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-card rounded-lg shadow-soft hover-lift transition-all border border-border group overflow-hidden"
            >
              <div className="aspect-[4/3] overflow-hidden bg-secondary relative">
                <img
                  src={v.img}
                  alt={v.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 bg-charcoal/95 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider border border-white/10">
                  {v.category}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-charcoal">{v.name}</h3>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-semibold bg-secondary px-2.5 py-1 rounded">
                    <Users className="w-3.5 h-3.5" /> {v.seats} Seats
                  </span>
                </div>

                {/* Amenities Badges */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-muted-foreground bg-secondary/70 px-2 py-1 rounded">
                    <UserCheck className="w-3 h-3 text-gold" /> Chauffeur
                  </span>
                  {v.acAvailable && (
                    <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-muted-foreground bg-secondary/70 px-2 py-1 rounded">
                      <Snowflake className="w-3 h-3 text-gold" /> AC
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-muted-foreground bg-secondary/70 px-2 py-1 rounded">
                    <Wifi className="w-3 h-3 text-gold" /> WiFi
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-muted-foreground bg-secondary/70 px-2 py-1 rounded">
                    <Compass className="w-3 h-3 text-gold" /> GPS
                  </span>
                </div>

                <div className="mt-4 rounded-lg bg-secondary/60 p-3 text-xs border border-border/50">
                  <div className="flex items-center gap-1.5 font-bold text-charcoal uppercase tracking-wider mb-2">
                    <BadgeDollarSign className="h-3.5 w-3.5 text-gold" />
                    Price per kilometer
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <span>AC Rate: <strong className="text-charcoal font-semibold">{formatLkr(v.acPricePerKm)}</strong></span>
                    <span>Non-AC Rate: <strong className="text-charcoal font-semibold">{v.nonAcAvailable ? formatLkr(v.nonAcPricePerKm) : "N/A"}</strong></span>
                  </div>
                </div>

                {v.stayPrices && (
                  <div className="mt-3 rounded-lg bg-secondary/60 p-3 text-xs border border-border/50">
                    <div className="flex items-center gap-1.5 font-bold text-charcoal uppercase tracking-wider mb-2">
                      <BadgeDollarSign className="h-3.5 w-3.5 text-gold" />
                      Daily Stay Charges
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-[10px] text-center text-muted-foreground">
                      {([1, 2, 3, 4, 5] as const).map((d) => (
                        <div key={d} className="border-r border-border last:border-r-0">
                          <div className="font-bold text-charcoal">{d} Day</div>
                          <div className="mt-0.5">{formatLkr(v.stayPrices![`day${d}` as keyof typeof v.stayPrices])}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-4 flex items-start gap-1.5 text-[10px] text-muted-foreground leading-relaxed">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gold" />
                  Rates shown are estimates. Final price customized per route requirements.
                </p>

                <a
                  href={waLink(
                    `Hi, I'd like a price inquiry for the ${v.name} (${v.seats} seats).`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gold text-gold-foreground font-semibold py-3 rounded-md hover:bg-gold/90 transition-all shadow-soft"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  Price Inquiry
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
