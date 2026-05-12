import logo from "@/assets/logo.jpg";
import { PHONE, PHONE_DISPLAY, EMAIL, ADDRESS } from "@/lib/contact";

export function Footer() {
  return (
    <footer className="bg-charcoal text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="Agra Taxis" className="w-12 h-12 rounded-full object-cover" />
            <span className="font-display font-bold text-xl">Agra Taxis</span>
          </div>
          <p className="mt-4 text-sm text-white/70">
            Sri Lanka's trusted islandwide vehicle rental and taxi service.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gold">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><a href="#home" className="hover:text-gold">Home</a></li>
            <li><a href="#about" className="hover:text-gold">About</a></li>
            <li><a href="#fleet" className="hover:text-gold">Our Fleet</a></li>
            <li><a href="#booking" className="hover:text-gold">Book Now</a></li>
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
            <li><a href={`tel:${PHONE}`} className="hover:text-gold">{PHONE_DISPLAY}</a></li>
            <li><a href={`mailto:${EMAIL}`} className="hover:text-gold">{EMAIL}</a></li>
            <li>{ADDRESS}</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-white/10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-white/60">
        © {new Date().getFullYear()} Agra Taxis. All rights reserved.
      </div>
    </footer>
  );
}
