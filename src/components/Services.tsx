import { motion } from "framer-motion";
import { Plane, Map, Heart, Briefcase, Car, Route, CalendarDays, Building2, ArrowRight } from "lucide-react";
import { waLink } from "@/lib/contact";

const services = [
  { icon: Plane, title: "Airport Transfers", desc: "Executive airport transfers with flight tracking and meet & greet services." },
  { icon: Map, title: "Tour Packages", desc: "Bespoke itineraries for corporate groups, VIP delegates, and leisure tours." },
  { icon: Heart, title: "Wedding Transport", desc: "Premium luxury sedans and guest transport coordinated for your special event." },
  { icon: Briefcase, title: "Staff Transport", desc: "SLA-backed daily employee commute programs for corporate offices." },
  { icon: Car, title: "Private Vehicle Hire", desc: "Chauffeur-driven executive vehicles available for private hire." },
  { icon: Route, title: "Long Distance Trips", desc: "Inter-city business travel with premium vehicle comfort and safety." },
  { icon: CalendarDays, title: "Daily Rentals", desc: "Flexible day rentals with dedicated professional drivers." },
  { icon: Building2, title: "Corporate Transport", desc: "Tailored fleet solutions for business meetings, events, and conferences." },
];

export function Services() {
  return (
    <section id="services" className="bg-charcoal py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-3">
            <span className="h-px w-6 bg-gold" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Our Services</span>
          </div>
          <h2 className="mt-5 text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Transport Solutions for
            <span className="text-white/50"> Every Need</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/50 lg:text-lg">
            Professional transport services designed for enterprises, couples, tourists, and individuals across Sri Lanka.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              className="group flex flex-col justify-between rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gold/30 hover:bg-white/7"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-gold/30 group-hover:bg-gold/10">
                  <s.icon className="h-5 w-5 text-white/50 transition-colors duration-300 group-hover:text-gold" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-white/90 transition-colors duration-300 group-hover:text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40 group-hover:text-white/55">
                  {s.desc}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold/60 transition-colors duration-300 group-hover:text-gold">
                Inquire Service
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
