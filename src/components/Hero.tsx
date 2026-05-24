import { motion } from "framer-motion";
import { Phone, CheckCircle2, ShieldCheck, Star } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { PHONE, waLink } from "@/lib/contact";

const hero = "/assets/hero.jpg";

export function Hero() {
  return (
    <section id="home" className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden bg-charcoal">
      <img
        src={hero}
        alt="Agra Taxis premium vehicle on Sri Lankan coastal road"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1280}
      />
      <div className="absolute inset-0 bg-charcoal/75" />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 via-charcoal/45 to-charcoal/95" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 w-full flex flex-col justify-between h-full min-h-[90svh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, cubicBezier: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mt-auto"
        >
          <span className="inline-flex items-center border-l-2 border-gold pl-3 text-gold text-xs sm:text-sm font-semibold uppercase tracking-[0.2em]">
            Enterprise-Grade Transport / Sri Lanka
          </span>

          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-semibold text-white leading-[1.08] text-balance">
            Executive Fleet Solutions <br />
            <span className="text-gold">& Professional Chauffeurs</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed">
            Agra Taxis delivers premium corporate travel, daily staff commutes, airport meet-and-greet transfers, and islandwide custom tours with absolute SLA compliance and safety.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <a
              href={waLink("Hello Agra Taxis, I would like to book an executive transport vehicle.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gold text-gold-foreground font-semibold px-8 py-4 rounded-md shadow-card hover:bg-gold/90 transition-all duration-200 hover:scale-[1.02]"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Book Executive Car
            </a>
            <a
              href={waLink("Hello Agra Taxis, I would like to inquire about corporate B2B contracts, billing accounts, and staff logistics.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 text-white font-semibold px-8 py-4 rounded-md hover:bg-white/10 transition-all duration-200 hover:border-gold/50"
            >
              Corporate Accounts
            </a>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-8"
        >
          {[
            { value: "50+", label: "Executive Fleet Vehicles" },
            { value: "99.9%", label: "On-Time Service SLA" },
            { value: "15,000+", label: "Completed Journeys" },
            { value: "24/7", label: "Priority Corporate Support" },
          ].map((stat, idx) => (
            <div key={idx}>
              <div className="text-2xl sm:text-3xl font-bold text-gold">{stat.value}</div>
              <div className="text-xs sm:text-sm text-white/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Corporate Partners Marquee */}
      <div className="relative z-10 w-full border-t border-white/5 bg-charcoal/80 backdrop-blur-sm py-4 overflow-hidden select-none">
        <div className="max-w-7xl mx-auto px-4 mb-2">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Our Services Meet Compliance Standards Of</span>
        </div>
        <div className="flex w-[200%] gap-12 items-center animate-marquee">
          {Array.from({ length: 2 }).map((_, repeatIdx) => (
            <div key={repeatIdx} className="flex shrink-0 justify-around w-1/2 items-center text-white/30 font-display font-medium text-sm tracking-wider">
              <span className="flex items-center gap-2 border-r border-white/15 pr-12"><ShieldCheck className="w-4 h-4 text-gold" /> ISO Compliant Logistics</span>
              <span className="flex items-center gap-2 border-r border-white/15 pr-12"><CheckCircle2 className="w-4 h-4 text-gold" /> B2B Hospitality SLA</span>
              <span className="flex items-center gap-2 border-r border-white/15 pr-12"><Star className="w-4 h-4 text-gold" /> 5-Star Diplomatic Transit</span>
              <span className="flex items-center gap-2 border-r border-white/15 pr-12"><ShieldCheck className="w-4 h-4 text-gold" /> Safe-Travel Certified</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gold" /> VIP Airport Concierge</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
