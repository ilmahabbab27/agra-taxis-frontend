import { motion } from "framer-motion";
import { Phone, Mail, MessageCircle, Facebook, Instagram, ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { PHONE, PHONE_DISPLAY, EMAIL, waLink } from "@/lib/contact";

const channels = [
  {
    icon: Phone,
    label: "Call Us",
    value: PHONE_DISPLAY,
    sub: "Available 24/7",
    href: `tel:${PHONE}`,
    accent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    icon: WhatsAppIcon,
    label: "WhatsApp",
    value: PHONE_DISPLAY,
    sub: "Instant response",
    href: waLink("Hello Agra Taxis, I would like to make a booking inquiry."),
    accent: "bg-whatsapp/10 text-whatsapp border-whatsapp/20",
    external: true,
  },
  {
    icon: Mail,
    label: "Email",
    value: EMAIL,
    sub: "Reply within 2 hours",
    href: `mailto:${EMAIL}`,
    accent: "bg-gold/10 text-gold border-gold/20",
  },
];

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden bg-white py-24 lg:py-32">
      {/* Decorative bg text */}
      <div className="pointer-events-none absolute -bottom-6 left-0 select-none font-black leading-none text-black/3 text-[10rem] lg:text-[14rem]">
        CONTACT
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr] lg:gap-24">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-3">
              <span className="h-px w-6 bg-gold" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Contact</span>
            </div>
            <h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-tight text-charcoal sm:text-5xl">
              Get in Touch
              <span className="block text-charcoal/30">With Us</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Available 24/7 to help plan your journey. Reach us via call, WhatsApp, or email — we respond fast.
            </p>

            {/* Social */}
            <div className="mt-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Follow Us</p>
              <div className="mt-4 flex gap-3">
                <a
                  href="https://web.facebook.com/Agra0723003000/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-border bg-[#f8f9fb] text-charcoal/50 transition-all duration-200 hover:border-[#1877F2]/30 hover:bg-[#1877F2]/8 hover:text-[#1877F2]"
                >
                  <Facebook className="h-4.5 w-4.5" />
                </a>
                <a
                  href="https://www.instagram.com/agrataxis/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-border bg-[#f8f9fb] text-charcoal/50 transition-all duration-200 hover:border-pink-500/30 hover:bg-pink-500/8 hover:text-pink-500"
                >
                  <Instagram className="h-4.5 w-4.5" />
                </a>
                <a
                  href={waLink("Hello!")}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-border bg-[#f8f9fb] text-charcoal/50 transition-all duration-200 hover:border-whatsapp/30 hover:bg-whatsapp/8 hover:text-whatsapp"
                >
                  <WhatsAppIcon className="h-4.5 w-4.5" />
                </a>
              </div>
            </div>

            {/* CTA card */}
            <motion.a
              href={waLink("Hello Agra Taxis, I would like to make a booking inquiry.")}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group mt-10 flex items-center justify-between rounded-2xl bg-charcoal p-6 transition-all duration-300 hover:bg-charcoal/90"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Ready to book?</p>
                <p className="mt-1 text-base font-bold text-white">Message us on WhatsApp</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-whatsapp/20 transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4 text-whatsapp" />
              </div>
            </motion.a>
          </motion.div>

          {/* Right — contact channels */}
          <div className="flex flex-col gap-4">
            {channels.map((ch, i) => (
              <motion.a
                key={ch.label}
                href={ch.href}
                target={ch.external ? "_blank" : undefined}
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex items-center gap-5 rounded-2xl border border-border bg-[#f8f9fb] p-6 transition-all duration-300 hover:border-transparent hover:bg-white hover:shadow-card"
              >
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${ch.accent}`}>
                  <ch.icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{ch.label}</p>
                  <p className="mt-0.5 truncate text-lg font-bold text-charcoal">{ch.value}</p>
                  <p className="text-xs text-muted-foreground">{ch.sub}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-charcoal" />
              </motion.a>
            ))}

            {/* Map placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-2 overflow-hidden rounded-2xl border border-border"
            >
              <iframe
                title="Agra Taxis Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63372.36905613577!2d80.5612755!3d7.2905714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3662de74a7cd5%3A0x1ad7d14d4a012228!2sKandy%2C%20Sri%20Lanka!5e0!3m2!1sen!2s!4v1234567890"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
