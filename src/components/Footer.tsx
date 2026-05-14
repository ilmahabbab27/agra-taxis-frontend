import { PHONE, PHONE_DISPLAY, EMAIL } from "@/lib/contact";

const logo = "/assets/logo.jpg";

export function Footer() {
  return (
    <footer className="bg-charcoal pt-16 pb-8 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="Agra Taxis" className="h-12 w-auto object-contain" />
            <span className="font-display text-xl font-bold">Agra Taxis</span>
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
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/agrataxis/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white/60 hover:text-gold transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-white/10 pt-6 text-sm text-white/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-center sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Agra Taxis. All rights reserved.</span>
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
