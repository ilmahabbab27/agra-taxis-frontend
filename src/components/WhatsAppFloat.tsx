import { motion } from "framer-motion";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { waLink } from "@/lib/contact";

export function WhatsAppFloat() {
  return (
    <motion.a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.25 }}
      className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-lg bg-whatsapp text-white shadow-card flex items-center justify-center hover:bg-whatsapp/90 transition-colors group"
      aria-label="Chat with Agra Taxis AI Chatbot on WhatsApp"
      title="WhatsApp AI Chatbot - Get instant fare estimation"
    >
      <WhatsAppIcon className="w-7 h-7" />
      <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat with AI Chatbot
      </span>
    </motion.a>
  );
}
