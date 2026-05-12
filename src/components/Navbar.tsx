import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { PHONE, PHONE_DISPLAY } from "@/lib/contact";

const links = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#fleet", label: "Fleet" },
  { href: "#booking", label: "Booking" },
  { href: "#contact", label: "Contact" },
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
        scrolled ? "bg-background/90 backdrop-blur-lg shadow-soft" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2">
          <img src={logo} alt="Agra Taxis" className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover" />
          <span className={`font-display font-bold text-lg md:text-xl ${scrolled ? "text-charcoal" : "text-white"}`}>
            Agra Taxis
          </span>
        </a>

        <div className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-gold ${
                scrolled ? "text-charcoal" : "text-white"
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${PHONE}`}
            className="hidden sm:inline-flex items-center gap-2 bg-gradient-gold text-gold-foreground font-semibold px-4 py-2.5 rounded-full text-sm shadow-gold hover:scale-105 transition-transform"
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
          className="lg:hidden bg-background border-t shadow-card"
        >
          <div className="px-4 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-lg text-charcoal font-medium hover:bg-secondary"
              >
                {l.label}
              </a>
            ))}
            <a
              href={`tel:${PHONE}`}
              className="mt-2 inline-flex items-center justify-center gap-2 bg-gradient-gold text-gold-foreground font-semibold px-4 py-3 rounded-full"
            >
              <Phone className="w-4 h-4" /> {PHONE_DISPLAY}
            </a>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
