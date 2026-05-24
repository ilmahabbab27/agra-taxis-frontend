import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { PHONE, PHONE_DISPLAY, waLink } from "@/lib/contact";

const logo = "/assets/logo.jpg";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/fleet", label: "Vehicles" },
  { to: "/booking", label: "Booking" },
  { to: "/contact", label: "Contact" },
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
      transition={{ duration: 0.5 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md border-b border-black/5 shadow-soft" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="Agra Taxis"
            className="h-10 md:h-12 w-auto object-contain rounded-md"
          />
        </a>

        <div className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className={`text-sm font-medium transition-colors hover:text-gold relative py-1.5 group ${
                scrolled ? "text-charcoal" : "text-white"
              }`}
            >
              {l.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={waLink("Hello Agra Taxis, I am interested in inquiring about your corporate transport services and B2B client accounts.")}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden md:inline-flex items-center gap-2 font-semibold px-4 py-2.5 rounded-md text-xs uppercase tracking-wider transition-all border ${
              scrolled
                ? "border-charcoal/20 text-charcoal hover:bg-charcoal hover:text-white"
                : "border-white/20 text-white hover:bg-white hover:text-charcoal"
            }`}
          >
            Corporate Solutions
          </a>
          <a
            href={`tel:${PHONE}`}
            className="hidden sm:inline-flex items-center gap-2 bg-gold text-gold-foreground font-semibold px-4 py-2.5 rounded-md text-sm hover:bg-gold/90 transition-all shadow-soft"
          >
            <Phone className="w-4 h-4" />
            {PHONE_DISPLAY}
          </a>
          <button
            onClick={() => setOpen(!open)}
            className={`lg:hidden p-2 rounded-md ${scrolled ? "text-charcoal" : "text-white"}`}
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden bg-white/95 backdrop-blur-md border-t border-black/5 shadow-card"
        >
          <div className="px-4 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.to}
                href={l.to}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-lg text-charcoal font-medium hover:bg-secondary transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href={waLink("Hello Agra Taxis, I am interested in inquiring about your corporate transport services and B2B client accounts.")}
              target="_blank; noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-2 border border-charcoal/20 text-charcoal hover:bg-charcoal hover:text-white font-semibold px-4 py-3 rounded-md text-sm transition-colors"
            >
              Corporate Solutions
            </a>
            <a
              href={`tel:${PHONE}`}
              className="mt-2 inline-flex items-center justify-center gap-2 bg-gold text-gold-foreground font-semibold px-4 py-3 rounded-md shadow-soft"
            >
              <Phone className="w-4 h-4" /> {PHONE_DISPLAY}
            </a>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
