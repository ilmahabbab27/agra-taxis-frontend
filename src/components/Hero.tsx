import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { PHONE, waLink } from "@/lib/contact";

const hero = "/assets/hero.jpg";

export function Hero() {
  return (
    <section id="home" className="relative min-h-[100svh] flex items-center overflow-hidden">
      <img
        src={hero}
        alt="Agra Taxis premium vehicle on Sri Lankan coastal road"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1280}
      />
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-charcoal/40" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 bg-gold/15 backdrop-blur-md text-gold border border-gold/30 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            Islandwide Transport • Sri Lanka
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.05] text-balance">
            Reliable Vehicle Rental & <span className="text-gold">Taxi Service</span> Across Sri Lanka
          </h1>
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-white/85 max-w-2xl text-balance">
            Comfortable, affordable, and islandwide transport solutions for tours, airport transfers,
            staff transport, and private hires.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={waLink("Hello Agra Taxis 🙏 I would like to book a vehicle.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-whatsapp text-white font-semibold px-6 py-4 rounded-full shadow-card hover:scale-[1.03] transition-transform"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Book via WhatsApp
            </a>
            <a
              href={`tel:${PHONE}`}
              className="inline-flex items-center justify-center gap-2 bg-gradient-gold text-gold-foreground font-semibold px-6 py-4 rounded-full shadow-gold hover:scale-[1.03] transition-transform"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </a>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-8 max-w-xl">
            {[
              { v: "10+", l: "Years Experience" },
              { v: "5K+", l: "Happy Customers" },
              { v: "24/7", l: "Available" },
            ].map((s) => (
              <div key={s.l} className="text-white">
                <div className="text-2xl sm:text-3xl font-bold text-gold">{s.v}</div>
                <div className="text-xs sm:text-sm text-white/75">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
