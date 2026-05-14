import { motion } from "framer-motion";
import { Phone, Mail, Facebook, Instagram } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { PHONE, PHONE_DISPLAY, EMAIL, waLink } from "@/lib/contact";

const items = [
  { icon: Phone, label: "Call Us", value: PHONE_DISPLAY, href: `tel:${PHONE}` },
  {
    icon: WhatsAppIcon,
    label: "WhatsApp",
    value: PHONE_DISPLAY,
    href: waLink("Hello Agra Taxis 🙏"),
  },
  { icon: Mail, label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
];

export function Contact() {
  return (
    <section id="contact" className="py-20 lg:py-28 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-gold font-semibold uppercase tracking-wider text-sm">Contact</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal text-balance">
            Get in Touch With Us
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Have questions? We're available 24/7 to help plan your journey.
          </p>
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-4">
            {items.map((it, i) => (
              <motion.a
                key={it.label}
                href={it.href}
                target={it.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-card rounded-2xl p-5 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all border border-border text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold mx-auto">
                  <it.icon className="w-5 h-5 text-gold-foreground" />
                </div>
                <div className="mt-4 text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                  {it.label}
                </div>
                <div className="mt-1 font-semibold text-charcoal break-words">{it.value}</div>
              </motion.a>
            ))}
          </div>

          <div className="mt-6 bg-card rounded-2xl p-6 shadow-soft border border-border">
            <h3 className="font-semibold text-charcoal">Follow Us</h3>
            <div className="mt-3 flex gap-3">
              <a
                href="https://web.facebook.com/Agra0723003000/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-secondary hover:bg-gradient-gold hover:text-gold-foreground flex items-center justify-center transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/agrataxis/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-secondary hover:bg-gradient-gold hover:text-gold-foreground flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={waLink("Hello!")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-secondary hover:bg-whatsapp hover:text-white flex items-center justify-center transition-all"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
