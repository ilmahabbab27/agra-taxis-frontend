import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/contact";

export function WhatsAppFloat() {
  return (
    <motion.a
      href={waLink("Hello Agra Taxis 🙏 I'd like to make an inquiry.")}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring" }}
      className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-whatsapp text-white shadow-card flex items-center justify-center hover:scale-110 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-whatsapp animate-ping opacity-30" />
      <MessageCircle className="w-7 h-7 relative" />
    </motion.a>
  );
}
