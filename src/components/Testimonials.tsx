import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const reviews = [
  { name: "Nimal Perera", role: "Colombo", text: "Excellent service! The driver was punctual and very professional. Highly recommend Agra Taxis for airport transfers.", rating: 5 },
  { name: "Sarah Williams", role: "Tourist, UK", text: "We hired a van for a 7-day tour around Sri Lanka. Comfortable vehicle, knowledgeable driver, and great prices. Best decision!", rating: 5 },
  { name: "Kamal Silva", role: "Kandy", text: "Used them for my wedding transport. Beautifully decorated car, on time, and very affordable. Thank you Agra Taxis!", rating: 5 },
  { name: "Priya Sharma", role: "Tourist, India", text: "Smooth booking via WhatsApp. The driver spoke good English and showed us amazing places. Would book again!", rating: 5 },
];

export function Testimonials() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % reviews.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-gold font-semibold uppercase tracking-wider text-sm">Testimonials</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal text-balance">
            What Our Customers Say
          </h2>
        </div>

        <div className="mt-12 relative">
          <div className="bg-card rounded-3xl p-8 sm:p-12 shadow-card border border-border min-h-[280px] relative overflow-hidden">
            <Quote className="absolute top-6 right-6 w-20 h-20 text-gold/10" />
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex gap-1">
                  {Array.from({ length: reviews[i].rating }).map((_, k) => (
                    <Star key={k} className="w-5 h-5 fill-gold text-gold" />
                  ))}
                </div>
                <p className="mt-5 text-lg sm:text-xl text-charcoal leading-relaxed">"{reviews[i].text}"</p>
                <div className="mt-6">
                  <div className="font-semibold text-charcoal">{reviews[i].name}</div>
                  <div className="text-sm text-muted-foreground">{reviews[i].role}</div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setI((p) => (p - 1 + reviews.length) % reviews.length)}
              className="w-11 h-11 rounded-full bg-secondary hover:bg-accent flex items-center justify-center transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 text-charcoal" />
            </button>
            <div className="flex gap-2">
              {reviews.map((_, k) => (
                <button
                  key={k}
                  onClick={() => setI(k)}
                  className={`h-2 rounded-full transition-all ${k === i ? "w-8 bg-gold" : "w-2 bg-border"}`}
                  aria-label={`Go to ${k + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setI((p) => (p + 1) % reviews.length)}
              className="w-11 h-11 rounded-full bg-secondary hover:bg-accent flex items-center justify-center transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 text-charcoal" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
