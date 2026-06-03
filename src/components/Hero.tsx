import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CheckCircle2, Star, ArrowRight, Calculator } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { waLink } from "@/lib/contact";

const bgImages = [
  "/assets/hero.jpg",
  "/assets/luxury.jpg",
  "/assets/suv.jpg",
  "/assets/van.jpg",
  "/assets/car.jpg",
];

export function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % bgImages.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-charcoal">

      {/* Rotating background */}
      <AnimatePresence mode="sync">
        <motion.img
          key={current}
          src={bgImages[current]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.4, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-charcoal/60" />
      <div className="absolute inset-0 bg-linear-to-b from-charcoal/10 via-charcoal/50 to-charcoal/98" />
      <div className="absolute inset-0 bg-linear-to-r from-charcoal/40 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[90svh] w-full max-w-7xl flex-col justify-between px-4 pb-12 pt-32 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-auto max-w-3xl"
        >
          <div className="inline-flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold/90">
              Enterprise-Grade Transport · Sri Lanka
            </span>
          </div>

          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[4.25rem]">
            Executive Fleet Solutions
            <span className="block text-gold">&amp; Professional Chauffeurs</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Premium corporate travel, airport meet-and-greet transfers, and islandwide custom tours — delivered with absolute SLA compliance.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={waLink("Hello Agra Taxis, I would like to book an executive transport vehicle.")}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-gold px-7 py-4 text-sm font-bold text-charcoal shadow-gold transition-all duration-300 hover:brightness-110 hover:shadow-lg"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Book Executive Car
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
            <a
              href="/booking"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-white/25 bg-white/8 px-7 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/15"
            >
              <Calculator className="h-4 w-4 text-gold" />
              Calculate Tour Fare
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
            {["Islandwide Coverage", "24/7 Support", "Certified Drivers", "Fixed Pricing"].map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-xs text-white/40">
                <span className="h-1 w-1 rounded-full bg-gold/60" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-16 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4"
        >
          {[
            { value: "50+", label: "Executive Fleet Vehicles" },
            { value: "99.9%", label: "On-Time Service SLA" },
            { value: "15,000+", label: "Completed Journeys" },
            { value: "24/7", label: "Priority Support" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold tracking-tight text-gold sm:text-3xl">{stat.value}</div>
              <div className="mt-1 text-xs text-white/50">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Image indicators */}
      <div className="absolute bottom-24 right-6 z-10 flex flex-col gap-1.5">
        {bgImages.map((_, k) => (
          <button
            key={k}
            onClick={() => setCurrent(k)}
            className={`rounded-full transition-all duration-300 ${k === current ? "h-6 w-1.5 bg-gold" : "h-1.5 w-1.5 bg-white/30 hover:bg-white/60"}`}
          />
        ))}
      </div>

      {/* Compliance marquee */}
      <div className="relative z-10 w-full overflow-hidden border-t border-white/5 bg-charcoal/85 py-3.5 backdrop-blur-sm">
        <div className="mx-auto mb-1.5 max-w-7xl px-4">
          <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/30">Compliance Standards</span>
        </div>
        <div className="flex w-[200%] animate-marquee items-center gap-12">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="flex w-1/2 shrink-0 items-center justify-around text-sm font-medium tracking-wider text-white/25">
              <span className="flex items-center gap-2 border-r border-white/10 pr-12"><ShieldCheck className="h-3.5 w-3.5 text-gold/60" /> ISO Compliant Logistics</span>
              <span className="flex items-center gap-2 border-r border-white/10 pr-12"><CheckCircle2 className="h-3.5 w-3.5 text-gold/60" /> B2B Hospitality SLA</span>
              <span className="flex items-center gap-2 border-r border-white/10 pr-12"><Star className="h-3.5 w-3.5 text-gold/60" /> 5-Star Diplomatic Transit</span>
              <span className="flex items-center gap-2 border-r border-white/10 pr-12"><ShieldCheck className="h-3.5 w-3.5 text-gold/60" /> Safe-Travel Certified</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-gold/60" /> VIP Airport Concierge</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
