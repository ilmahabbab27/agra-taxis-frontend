import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Briefcase, Snowflake, MessageCircle } from "lucide-react";
import car from "@/assets/car.jpg";
import van from "@/assets/van.jpg";
import suv from "@/assets/suv.jpg";
import luxury from "@/assets/luxury.jpg";
import minibus from "@/assets/minibus.jpg";
import bus from "@/assets/bus.jpg";
import { waLink } from "@/lib/contact";

type Category = "All" | "Cars" | "Vans" | "SUVs" | "Luxury" | "Mini Buses" | "Buses";

const fleet: { name: string; category: Exclude<Category, "All">; img: string; pax: number; luggage: number; ac: boolean }[] = [
  { name: "Toyota Axio / Premio", category: "Cars", img: car, pax: 4, luggage: 2, ac: true },
  { name: "Toyota KDH Van", category: "Vans", img: van, pax: 9, luggage: 6, ac: true },
  { name: "Toyota Land Cruiser", category: "SUVs", img: suv, pax: 6, luggage: 4, ac: true },
  { name: "Mercedes-Benz E-Class", category: "Luxury", img: luxury, pax: 4, luggage: 3, ac: true },
  { name: "Coaster Mini Bus", category: "Mini Buses", img: minibus, pax: 22, luggage: 15, ac: true },
  { name: "Tourist Coach", category: "Buses", img: bus, pax: 45, luggage: 30, ac: true },
];

const categories: Category[] = ["All", "Cars", "Vans", "SUVs", "Luxury", "Mini Buses", "Buses"];

export function Fleet() {
  const [active, setActive] = useState<Category>("All");
  const filtered = active === "All" ? fleet : fleet.filter((f) => f.category === active);

  return (
    <section id="fleet" className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-gold font-semibold uppercase tracking-wider text-sm">Our Fleet</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal text-balance">
            Premium Vehicles for Every Need
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Well-maintained, comfortable vehicles ready for your journey.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
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
                  <span className="text-xs font-semibold text-gold uppercase tracking-wider">{v.category}</span>
                  {v.ac && (
                    <span className="inline-flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded-full text-charcoal">
                      <Snowflake className="w-3 h-3" /> AC
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-lg font-semibold text-charcoal">{v.name}</h3>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4" /> {v.pax} pax</span>
                  <span className="inline-flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {v.luggage} bags</span>
                </div>
                <a
                  href={waLink(`Hi, I'd like a price inquiry for the ${v.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-gold-foreground font-semibold py-3 rounded-xl hover:shadow-gold transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
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
