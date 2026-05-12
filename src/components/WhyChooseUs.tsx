import { motion } from "framer-motion";
import { Globe2, Zap, BadgeDollarSign, Award, Clock } from "lucide-react";

const items = [
  { icon: Globe2, title: "Islandwide Service", desc: "Coverage across all 9 provinces of Sri Lanka", stat: "9/9" },
  { icon: Zap, title: "Fast Response", desc: "Reply within minutes, any time of day", stat: "<5 min" },
  { icon: BadgeDollarSign, title: "Affordable Rates", desc: "Best prices with no hidden charges", stat: "Best" },
  { icon: Award, title: "Experienced Drivers", desc: "Trained, licensed and courteous chauffeurs", stat: "10+ yrs" },
  { icon: Clock, title: "24/7 Support", desc: "Always available — day or night", stat: "24/7" },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 lg:py-28 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-gold font-semibold uppercase tracking-wider text-sm">Why Choose Us</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal text-balance">
            The Smart Way to Travel Sri Lanka
          </h2>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-card rounded-2xl p-6 text-center shadow-soft hover:shadow-card hover:-translate-y-1 transition-all border border-border"
            >
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold">
                <it.icon className="w-7 h-7 text-gold-foreground" />
              </div>
              <div className="mt-4 text-2xl font-bold text-charcoal">{it.stat}</div>
              <h3 className="mt-1 font-semibold text-charcoal">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
