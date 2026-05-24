import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const logo = "/assets/logo.jpg";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-charcoal"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col items-center gap-6"
          >
            <img
              src={logo}
              alt="Agra Taxis"
              className="h-28 md:h-36 w-auto object-contain"
            />
            <p className="text-white/50 text-sm tracking-widest uppercase font-medium">
              Reliable Transport Across Sri Lanka
            </p>
          </motion.div>

          <div className="absolute bottom-16 h-px w-24 bg-gold/60" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
