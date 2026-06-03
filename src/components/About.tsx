import { motion } from "framer-motion";
import { ShieldCheck, MapPin, UserCheck, Snowflake, Wallet, Heart } from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "Trusted Service", desc: "Sri Lanka's reliable transport partner" },
  { icon: MapPin, title: "Islandwide Coverage", desc: "Travel anywhere, any time" },
  { icon: UserCheck, title: "Professional Drivers", desc: "Experienced, courteous, licensed" },
  { icon: Snowflake, title: "AC & Non-AC Vehicles", desc: "Comfort tailored to your budget" },
  { icon: Wallet, title: "Transparent Pricing", desc: "Clear rates with no hidden fees" },
  { icon: Heart, title: "Safe & Comfortable", desc: "Well-maintained vehicles for every trip" },
];

export function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-white py-24 lg:py-32">
      {/* Decorative background text */}
      <div className="pointer-events-none absolute -top-4 right-0 select-none font-display text-[10rem] font-black leading-none text-black/3 lg:text-[14rem]">
        AGRA
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-24">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-3">
              <span className="h-px w-6 bg-gold" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">About Us</span>
            </div>

            <h2 className="mt-5 text-balance text-4xl font-black leading-[1.02] tracking-tight text-charcoal sm:text-5xl lg:text-6xl">
              Sri Lanka's
              <span className="block text-charcoal/30">Premium Transport</span>
              <span className="block text-charcoal">Partner</span>
            </h2>

            <p className="mt-8 max-w-lg text-base leading-relaxed text-muted-foreground lg:text-lg">
              Agra Taxis operates a complete fleet of comfortable cars, vans, SUVs, and luxury vehicles
              with experienced drivers who know every corner of the island. Whether you are heading
              to the airport, exploring tea country, or moving your team, we deliver a smooth,
              safe, and affordable journey.
            </p>

            {/* Live badge */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-secondary/60 px-5 py-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-whatsapp opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-whatsapp" />
              </span>
              <span className="text-sm font-semibold text-charcoal">Available 24/7 across Sri Lanka</span>
            </div>

            {/* Large stats */}
            <div className="mt-12 grid grid-cols-3 divide-x divide-border">
              {[
                { value: "10+", label: "Years" },
                { value: "50+", label: "Vehicles" },
                { value: "9", label: "Provinces" },
              ].map((s) => (
                <div key={s.label} className="px-6 first:pl-0 last:pr-0">
                  <div className="text-4xl font-black tracking-tight text-charcoal lg:text-5xl">{s.value}</div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — feature grid */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="group rounded-2xl border border-transparent bg-[#f8f9fb] p-5 transition-all duration-300 hover:border-gold/20 hover:bg-white hover:shadow-card"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-soft transition-all duration-300 group-hover:bg-gold/10 group-hover:shadow-none">
                  <f.icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-charcoal">{f.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
