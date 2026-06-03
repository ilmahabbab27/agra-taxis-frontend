import { motion } from "framer-motion";
import { Calculator, ArrowRight, MapPin } from "lucide-react";

export function FareStripe() {
  return (
    <div className="relative overflow-hidden bg-gold">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)",
        backgroundSize: "12px 12px",
      }} />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 py-6 sm:flex-row sm:px-6 lg:px-8"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-charcoal/15">
            <Calculator className="h-6 w-6 text-charcoal" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-bold text-charcoal sm:text-lg">Calculate Your Tour Fare Instantly</span>
            <span className="text-sm text-charcoal/65 hidden sm:block">Enter your pickup &amp; destination to get an instant fare estimate</span>
          </div>
        </div>

        <a
          href="/booking"
          className="group inline-flex shrink-0 items-center gap-2.5 rounded-full bg-charcoal px-7 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-charcoal/90 hover:shadow-lg"
        >
          <MapPin className="h-4 w-4" />
          Get Fare Estimate
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>
      </motion.div>
    </div>
  );
}
