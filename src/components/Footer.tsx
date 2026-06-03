import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { PHONE, PHONE_DISPLAY, EMAIL } from "@/lib/contact";

const logo = "/assets/logo.jpg";

export function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      {/* Gold accent line */}
      <div className="h-px bg-linear-to-r from-transparent via-gold/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Agra Taxis" className="h-11 w-auto rounded-lg object-contain" />
              <div>
                <div className="font-display text-lg font-bold leading-tight">Agra Taxis</div>
                <div className="text-[10px] uppercase tracking-widest text-gold/60">Sri Lanka</div>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-white/45">
              Sri Lanka's trusted islandwide vehicle rental and taxi service. Professional drivers, transparent pricing, 24/7 availability.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://web.facebook.com/Agra0723003000/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all hover:border-gold/30 hover:bg-gold/8 hover:text-gold"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/agrataxis/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all hover:border-gold/30 hover:bg-gold/8 hover:text-gold"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-gold/70">Quick Links</h4>
            <ul className="mt-5 space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
                { href: "/services", label: "Services" },
                { href: "/fleet", label: "Vehicles" },
                { href: "/booking", label: "Book Now" },
                { href: "/contact", label: "Contact" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <a href={href} className="group flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-white">
                    <span className="h-px w-0 bg-gold transition-all duration-300 group-hover:w-4" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-gold/70">Services</h4>
            <ul className="mt-5 space-y-2.5 text-sm text-white/45">
              {["Airport Transfers", "Tour Packages", "Wedding Transport", "Corporate Transport", "Staff Transport", "Daily Rentals"].map((s) => (
                <li key={s} className="leading-snug">{s}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-gold/70">Contact</h4>
            <ul className="mt-5 space-y-4">
              <li>
                <a href={`tel:${PHONE}`} className="group flex items-start gap-3 text-sm text-white/45 transition-colors hover:text-white">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold/50" />
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="group flex items-start gap-3 text-sm text-white/45 transition-colors hover:text-white">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold/50" />
                  {EMAIL}
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-white/45">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold/50" />
                  Agra, Sri Lanka
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 py-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row">
            <span className="text-xs text-white/30">
              © {new Date().getFullYear()} Agra Taxis. All rights reserved.
            </span>
            <a
              href="https://wa.me/94764627123"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/25 transition-colors hover:text-gold/60"
            >
              Developed by Ilma
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
