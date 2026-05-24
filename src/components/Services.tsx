import { motion } from "framer-motion";
import { Plane, Map, Heart, Briefcase, Car, Route, CalendarDays, Building2, ArrowRight } from "lucide-react";
import { waLink } from "@/lib/contact";

const services = [
  { icon: Plane, title: "Airport Transfers", desc: "Executive airport transfers with flight tracking and meet & greet services." },
  { icon: Map, title: "Tour Packages", desc: "Bespoke itineraries for corporate groups, VIP delegates, and tours." },
  { icon: Heart, title: "Wedding Transport", desc: "Premium luxury sedans and guest transport coordinated for your special event." },
  { icon: Briefcase, title: "Staff Transport", desc: "SLA-backed daily employee commute programs for corporate offices." },
  { icon: Car, title: "Private Vehicle Hire", desc: "Chauffeur-driven executive vehicles available for private hire." },
  { icon: Route, title: "Long Distance Trips", desc: "Inter-city business travel with premium vehicle comfort and safety." },
  { icon: CalendarDays, title: "Daily Rentals", desc: "Flexible day rentals with dedicated professional drivers." },
  { icon: Building2, title: "Corporate Transport", desc: "Tailored fleet solutions for business meetings, events, and conferences." },
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
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal text-balance">
            Transport Solutions for Every Corporate Need
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Choose from a focused range of professional transport services designed for enterprises and individuals.
          </p>
        </motion.div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              className="group bg-card rounded-lg p-6 shadow-soft hover-lift transition-all border border-border flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-md bg-secondary text-gold flex items-center justify-center group-hover:bg-gold group-hover:text-gold-foreground transition-colors duration-300">
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="mt-5 font-semibold text-lg text-charcoal group-hover:text-gold transition-colors duration-300">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-gold uppercase tracking-wider">
                Inquire Service
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
