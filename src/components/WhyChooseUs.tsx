import { motion } from "framer-motion";
import { Globe2, Zap, BadgeDollarSign, Award, Clock } from "lucide-react";

const items = [
  { icon: Globe2, title: "Islandwide Network", desc: "SLA-backed route coverage across all 9 provinces.", stat: "National" },
  { icon: Zap, title: "Rapid Response", desc: "Dedicated dispatch coordinators active 24/7.", stat: "<5 Min" },
  { icon: BadgeDollarSign, title: "Corporate Billing", desc: "Transparent billing with structured tax invoices.", stat: "Auditable" },
  { icon: Award, title: "Chauffeur Standards", desc: "Vetted, English-speaking professional drivers.", stat: "Certified" },
  { icon: Clock, title: "Operations Desk", desc: "Constant flight-tracking and fleet monitoring.", stat: "24/7 SLA" },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 lg:py-28 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-gold font-semibold uppercase tracking-wider text-sm">Why Choose Us</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal text-balance">
            The Executive Transport Standard
          </h2>
          <p className="mt-4 text-muted-foreground text-base">
            Providing reliable and compliant business travel, logistics operations, and private transit solutions across Sri Lanka.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-card rounded-lg p-6 text-center shadow-soft hover-lift transition-all border border-border flex flex-col justify-between"
            >
              <div>
                <div className="mx-auto w-11 h-11 rounded-md bg-accent flex items-center justify-center">
                  <it.icon className="w-5 h-5 text-gold-foreground" />
                </div>
                <div className="mt-5 text-3xl font-extrabold text-charcoal tracking-tight">{it.stat}</div>
                <h3 className="mt-2 font-semibold text-charcoal text-base">{it.title}</h3>
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
