import { motion } from "framer-motion";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { waLink } from "@/lib/contact";

export function WhatsAppFloat() {
  return (
    <motion.a
      href={waLink("Hello Agra Taxis, I'd like to make an inquiry.")}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.25 }}
      className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-lg bg-whatsapp text-white shadow-card flex items-center justify-center hover:bg-whatsapp/90 transition-colors"
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon className="w-7 h-7" />
    </motion.a>
  );
}
