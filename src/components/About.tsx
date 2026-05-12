import { motion } from "framer-motion";
import { ShieldCheck, MapPin, UserCheck, Snowflake, Wallet, Heart } from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "Trusted Service", desc: "Sri Lanka's reliable transport partner" },
  { icon: MapPin, title: "Islandwide Coverage", desc: "Travel anywhere, any time" },
  { icon: UserCheck, title: "Professional Drivers", desc: "Experienced, courteous, licensed" },
  { icon: Snowflake, title: "AC & Non-AC Vehicles", desc: "Comfort tailored to your budget" },
  { icon: Wallet, title: "Affordable Pricing", desc: "Transparent rates, no hidden fees" },
  { icon: Heart, title: "Safe & Comfortable", desc: "Your safety is our top priority" },
];

export function About() {
  return (
    <section id="about" className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-gold font-semibold uppercase tracking-wider text-sm">About Us</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal text-balance">
              Sri Lanka's Premium Transport & Tour Partner
            </h2>
            <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
              Agra Taxis offers a complete fleet of comfortable cars, vans, SUVs, and luxury vehicles
              with experienced drivers who know every corner of the island. Whether you're heading
              to the airport, exploring tea country, or moving your team — we deliver a smooth,
              safe and affordable journey.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 bg-secondary px-5 py-3 rounded-full">
              <div className="w-2.5 h-2.5 bg-whatsapp rounded-full animate-pulse" />
              <span className="text-sm font-medium text-charcoal">Available 24/7 across Sri Lanka</span>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="bg-card border border-border rounded-2xl p-5 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                  <f.icon className="w-5 h-5 text-gold-foreground" />
                </div>
                <h3 className="mt-4 font-semibold text-charcoal">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
