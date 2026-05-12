import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle, Facebook, Instagram } from "lucide-react";
import { PHONE, PHONE_DISPLAY, EMAIL, ADDRESS, waLink } from "@/lib/contact";

const items = [
  { icon: Phone, label: "Call Us", value: PHONE_DISPLAY, href: `tel:${PHONE}` },
  { icon: MessageCircle, label: "WhatsApp", value: PHONE_DISPLAY, href: waLink("Hello Agra Taxis 🙏") },
  { icon: Mail, label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
  { icon: MapPin, label: "Office", value: ADDRESS, href: "#" },
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

        <div className="mt-12 grid lg:grid-cols-2 gap-8">
          <div>
            <div className="grid sm:grid-cols-2 gap-4">
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
                  className="bg-card rounded-2xl p-5 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all border border-border"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                    <it.icon className="w-5 h-5 text-gold-foreground" />
                  </div>
                  <div className="mt-4 text-xs uppercase font-semibold text-muted-foreground tracking-wider">{it.label}</div>
                  <div className="mt-1 font-semibold text-charcoal break-words">{it.value}</div>
                </motion.a>
              ))}
            </div>

            <div className="mt-6 bg-card rounded-2xl p-6 shadow-soft border border-border">
              <h3 className="font-semibold text-charcoal">Follow Us</h3>
              <div className="mt-3 flex gap-3">
                <a href="#" className="w-11 h-11 rounded-full bg-secondary hover:bg-gradient-gold hover:text-gold-foreground flex items-center justify-center transition-all" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-11 h-11 rounded-full bg-secondary hover:bg-gradient-gold hover:text-gold-foreground flex items-center justify-center transition-all" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href={waLink("Hello!")} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-secondary hover:bg-whatsapp hover:text-white flex items-center justify-center transition-all" aria-label="WhatsApp">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl overflow-hidden shadow-card border border-border min-h-[400px]"
          >
            <iframe
              title="Agra Taxis Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126743.37487719993!2d79.78215493592276!3d6.921833781025394!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo!5e0!3m2!1sen!2slk!4v1700000000000"
              className="w-full h-full min-h-[400px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
