import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BadgeDollarSign, Info, Snowflake, Users } from "lucide-react";
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
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal text-balance">
            Premium Vehicles for Every Need
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Choose by category, seats, comfort type, and per-kilometer rate.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {categoryList.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                active === c
                  ? "bg-charcoal text-white shadow-card"
                  : "bg-secondary text-charcoal hover:bg-accent"
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
              className="bg-card rounded-2xl shadow-soft hover:shadow-card transition-all overflow-hidden border border-border group"
            >
              <div className="aspect-[4/3] overflow-hidden bg-secondary">
                <img
                  src={v.img}
                  alt={v.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gold uppercase tracking-wider">
                    {v.category}
                  </span>
                  {v.acAvailable && (
                    <span className="inline-flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded-full text-charcoal">
                      <Snowflake className="w-3 h-3" /> AC
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-lg font-semibold text-charcoal">{v.name}</h3>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> {v.seats} seats
                  </span>
                </div>
                <div className="mt-4 rounded-xl bg-secondary px-3 py-2 text-sm">
                  <div className="flex items-center gap-1.5 font-semibold text-charcoal">
                    <BadgeDollarSign className="h-4 w-4" />
                    Price per km
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>AC: {formatLkr(v.acPricePerKm)}</span>
                    <span>Non AC: {v.nonAcAvailable ? formatLkr(v.nonAcPricePerKm) : "N/A"}</span>
                  </div>
                </div>

                {v.stayPrices && (
                  <div className="mt-3 rounded-xl bg-secondary px-3 py-2 text-sm">
                    <div className="flex items-center gap-1.5 font-semibold text-charcoal mb-1.5">
                      <BadgeDollarSign className="h-4 w-4" />
                      Stay / Daily Charges
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-xs text-center text-muted-foreground">
                      {([1, 2, 3, 4, 5] as const).map((d) => (
                        <div key={d}>
                          <div className="font-semibold text-charcoal">{d}d</div>
                          <div>{formatLkr(v.stayPrices![`day${d}` as keyof typeof v.stayPrices])}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground leading-relaxed">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gold" />
                  Prices are estimates and may vary. Contact our hotline via call or WhatsApp for exact pricing.
                </p>

                <a
                  href={waLink(
                    `Hi, I'd like a price inquiry for the ${v.name} (${v.seats} seats).`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-gold-foreground font-semibold py-3 rounded-xl hover:shadow-gold transition-all"
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
