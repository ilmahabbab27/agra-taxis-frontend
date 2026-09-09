import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { PHONE, PHONE_DISPLAY } from "@/lib/contact";

const logo = "/assets/logo.jpg";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/fleet", label: "Vehicles" },
  { to: "/booking", label: "Booking" },
  { to: "/contact", label: "Contact" },
  { to: "/drivers/register", label: "Join as driver" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-black/6 bg-white/90 shadow-soft backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 md:h-20">
        <a href="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Agra Taxis" className="h-9 w-auto rounded-md object-contain md:h-11" />
          <span className={`hidden font-display text-base font-bold tracking-tight sm:block ${scrolled ? "text-charcoal" : "text-white"}`}>
            Agra Taxis
          </span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className={`group relative py-1 text-sm font-medium transition-colors hover:text-gold ${
                scrolled ? "text-charcoal/80" : "text-white/85"
              }`}
            >
              {l.label}
              <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/drivers/login"
            className={`hidden rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 md:inline-flex ${
              scrolled
                ? "border border-gold/40 text-charcoal hover:border-gold hover:bg-gold/10"
                : "border border-white/25 text-white/90 hover:border-white hover:bg-white/10"
            }`}
          >
            Driver login
          </a>
          <a
            href="/booking"
            className={`hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 md:inline-flex ${
              scrolled
                ? "border border-charcoal/15 text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-white"
                : "border border-white/20 text-white/90 hover:border-white hover:bg-white/10"
            }`}
          >
            Calculate Fare
          </a>
          <a
            href={`tel:${PHONE}`}
            className="hidden items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-charcoal shadow-gold transition-all duration-200 hover:brightness-110 sm:inline-flex"
          >
            <Phone className="h-3.5 w-3.5" />
            {PHONE_DISPLAY}
          </a>
          <button
            onClick={() => setOpen(!open)}
            className={`rounded-lg p-2 transition-colors lg:hidden ${scrolled ? "text-charcoal hover:bg-secondary" : "text-white hover:bg-white/10"}`}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-black/5 bg-white/98 shadow-card backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {links.map((l) => (
                <a
                  key={l.to}
                  href={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-charcoal/80 transition-colors hover:bg-secondary hover:text-charcoal"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href="/drivers/login"
                  className="inline-flex items-center justify-center rounded-xl border border-gold/40 px-4 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-gold/10"
                >
                  Driver login
                </a>
                <a
                  href="/booking"
                  className="inline-flex items-center justify-center rounded-xl border border-charcoal/15 px-4 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-charcoal hover:text-white"
                >
                  Calculate Fare
                </a>
                <a
                  href={`tel:${PHONE}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-bold text-charcoal shadow-gold"
                >
                  <Phone className="h-4 w-4" /> Call
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
