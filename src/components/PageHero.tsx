import { motion } from "framer-motion";

interface PageHeroProps {
  image: string;
  title: string;
  subtitle: string;
}

export function PageHero({ image, title, subtitle }: PageHeroProps) {
  return (
    <section className="relative h-64 sm:h-80 md:h-96 flex items-center justify-center overflow-hidden">
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-charcoal/65" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative text-center px-4"
      >
        <span className="text-gold font-semibold uppercase tracking-widest text-sm">
          Agra Taxis
        </span>
        <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-bold text-white">
          {title}
        </h1>
        <p className="mt-4 text-white/70 text-lg max-w-xl mx-auto">{subtitle}</p>
      </motion.div>
    </section>
  );
}
