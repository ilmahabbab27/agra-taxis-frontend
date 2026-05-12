import { motion } from "framer-motion";
import { Plane, Map, Heart, Briefcase, Car, Route, CalendarDays, Building2 } from "lucide-react";
import { waLink } from "@/lib/contact";

const services = [
  { icon: Plane, title: "Airport Transfers", desc: "On-time pickups & drop-offs to BIA / Mattala" },
  { icon: Map, title: "Tour Packages", desc: "Customized islandwide tour itineraries" },
  { icon: Heart, title: "Wedding Transport", desc: "Decorated vehicles for your special day" },
  { icon: Briefcase, title: "Staff Transport", desc: "Daily office & factory pick-up service" },
  { icon: Car, title: "Private Vehicle Hire", desc: "Self-drive or with chauffeur options" },
  { icon: Route, title: "Long Distance Trips", desc: "Comfortable rides to any city" },
  { icon: CalendarDays, title: "Daily Rentals", desc: "Flexible per-day vehicle rentals" },
  { icon: Building2, title: "Corporate Transport", desc: "Premium service for businesses" },
];

export function Services() {
  return (
    <section id="services" className="py-20 lg:py-28 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="text-gold font-semibold uppercase tracking-wider text-sm">Our Services</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal text-balance">
            Transport Solutions for Every Journey
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Choose from our wide range of professional transport services.
          </p>
        </motion.div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s, i) => (
            <motion.a
              key={s.title}
              href={waLink(`Hello, I'm interested in your ${s.title} service.`)}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group relative bg-card rounded-2xl p-6 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all border border-border overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/0 group-hover:bg-gold/10 rounded-full blur-2xl transition-all" />
              <div className="relative w-12 h-12 rounded-xl bg-charcoal text-gold flex items-center justify-center group-hover:bg-gradient-gold group-hover:text-gold-foreground transition-all">
                <s.icon className="w-6 h-6" />
              </div>
              <h3 className="relative mt-5 font-semibold text-lg text-charcoal">{s.title}</h3>
              <p className="relative mt-2 text-sm text-muted-foreground">{s.desc}</p>
              <div className="relative mt-4 text-xs font-semibold text-gold uppercase tracking-wider">
                Inquire →
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
