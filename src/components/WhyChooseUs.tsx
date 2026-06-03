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
    <section className="relative overflow-hidden bg-charcoal py-24 lg:py-32">
      {/* Decorative background number */}
      <div className="pointer-events-none absolute -bottom-8 right-0 select-none font-black leading-none text-white/2 text-[12rem] lg:text-[18rem]">
        WHY
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[1fr_2fr] lg:gap-20">

          {/* Left — sticky header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="inline-flex items-center gap-3">
              <span className="h-px w-6 bg-gold" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Why Choose Us</span>
            </div>
            <h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl">
              The Executive
              <span className="block text-white/30">Transport</span>
              <span className="block text-white">Standard</span>
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-white/45">
              Reliable and compliant business travel, logistics, and private transit solutions across Sri Lanka.
            </p>
            <div className="mt-8 h-px w-16 bg-gold/40" />
          </motion.div>

          {/* Right — items */}
          <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
            {items.map((it, i) => (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gold/25 hover:bg-white/7"
              >
                {/* Large background stat */}
                <div className="pointer-events-none absolute -right-3 -top-4 select-none font-black text-6xl leading-none text-white/4 transition-all duration-300 group-hover:text-gold/6">
                  {it.stat}
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-gold/25 group-hover:bg-gold/10">
                  <it.icon className="h-5 w-5 text-white/50 transition-colors duration-300 group-hover:text-gold" />
                </div>

                <div className="mt-4 text-2xl font-black tracking-tight text-white">{it.stat}</div>
                <h3 className="mt-1 text-sm font-bold text-white/80">{it.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/40">{it.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
