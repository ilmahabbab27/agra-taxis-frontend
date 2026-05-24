import { Facebook, Instagram } from "lucide-react";
import { PHONE, PHONE_DISPLAY, EMAIL } from "@/lib/contact";

const logo = "/assets/logo.jpg";

export function Footer() {
  return (
    <footer className="bg-charcoal pt-16 pb-8 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="Agra Taxis" className="h-12 w-auto object-contain" />
            <span className="text-xl font-semibold">Agra Taxis</span>
          </div>
          <p className="mt-4 text-sm text-white/70">
            Sri Lanka's trusted islandwide vehicle rental and taxi service.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gold">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><a href="/" className="hover:text-gold">Home</a></li>
            <li><a href="/about" className="hover:text-gold">About</a></li>
            <li><a href="/services" className="hover:text-gold">Services</a></li>
            <li><a href="/fleet" className="hover:text-gold">Vehicles</a></li>
            <li><a href="/booking" className="hover:text-gold">Book Now</a></li>
            <li><a href="/contact" className="hover:text-gold">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gold">Services</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>Airport Transfers</li>
            <li>Tour Packages</li>
            <li>Wedding Transport</li>
            <li>Corporate Transport</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gold">Contact</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>
              <a href={`tel:${PHONE}`} className="hover:text-gold">
                {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`} className="hover:text-gold">
                {EMAIL}
              </a>
            </li>
          </ul>
          <div className="mt-4 flex gap-3">
            <a
              href="https://web.facebook.com/Agra0723003000/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-white/60 hover:text-gold transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/agrataxis/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white/60 hover:text-gold transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-white/10 pt-6 text-sm text-white/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-center sm:flex-row sm:px-6 lg:px-8">
          <span>(c) {new Date().getFullYear()} Agra Taxis. All rights reserved.</span>
          <a
            href="https://wa.me/94764627123"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold"
          >
            Developed by ilma
          </a>
        </div>
      </div>
    </footer>
  );
}
