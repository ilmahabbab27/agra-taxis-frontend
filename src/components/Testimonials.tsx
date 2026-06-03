import { motion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";

const GOOGLE_REVIEW_URL =
  "https://www.google.com/search?q=Agra+Taxis+Reviews&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOT_ODJ9VRuQGr24ajzyygysN1d2mDUOKi90eEuE3XdZFpCHESrHasMc13skN_0QPPyZVKAq5ToNuAKHFsxQX78M29MII";

const WRITE_REVIEW_URL =
  "https://search.google.com/local/writereview?placeid=ChIJW6N3cXZR4joRKCYBSt3R1xo";

const reviews = [
  {
    name: "Nimal Perera",
    location: "Colombo",
    rating: 5,
    date: "2 weeks ago",
    text: "Excellent service! The driver was punctual and very professional. Highly recommend Agra Taxis for airport transfers. Will definitely use again.",
    avatar: "NP",
  },
  {
    name: "Sarah Williams",
    location: "Tourist, UK",
    rating: 5,
    date: "1 month ago",
    text: "We hired a van for a 7-day tour around Sri Lanka. Comfortable vehicle, knowledgeable driver, and great prices. Best decision we made for our trip!",
    avatar: "SW",
  },
  {
    name: "Kamal Silva",
    location: "Kandy",
    rating: 5,
    date: "3 weeks ago",
    text: "Used them for my wedding transport. Beautifully decorated car, on time, and very affordable. Thank you Agra Taxis! Highly recommended.",
    avatar: "KS",
  },
  {
    name: "Priya Sharma",
    location: "Tourist, India",
    rating: 5,
    date: "1 month ago",
    text: "Smooth booking via WhatsApp. The driver spoke good English and showed us amazing places. Would absolutely book again on our next visit.",
    avatar: "PS",
  },
  {
    name: "Amara Jayasuriya",
    location: "Galle",
    rating: 5,
    date: "2 months ago",
    text: "Very reliable for our corporate team transfers. Clean vehicles, professional drivers. Invoicing was smooth. Highly recommended for businesses.",
    avatar: "AJ",
  },
  {
    name: "James Thompson",
    location: "Tourist, Australia",
    rating: 5,
    date: "3 months ago",
    text: "Booked for our family trip from Colombo to Ella. Driver was fantastic, safe driver and very friendly. Great value for money overall.",
    avatar: "JT",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, k) => (
        <Star
          key={k}
          className={`h-3.5 w-3.5 ${k < count ? "fill-[#fbbc04] text-[#fbbc04]" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="reviews" className="bg-[#f8f9fb] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-3">
              <span className="h-px w-6 bg-gold" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Customer Reviews</span>
            </div>
            <h2 className="mt-5 text-balance text-3xl font-bold leading-tight tracking-tight text-charcoal sm:text-4xl lg:text-5xl">
              What Our Customers Say
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Trusted by thousands of travellers, corporate clients, and tourists across Sri Lanka.
            </p>
          </div>

          {/* Google rating card */}
          <motion.a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group flex shrink-0 items-center gap-5 rounded-2xl border border-border bg-white px-7 py-5 shadow-soft transition-all duration-300 hover:shadow-card"
          >
            {/* Google G */}
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-soft border border-border">
              <svg viewBox="0 0 24 24" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Google Rating</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-charcoal">5.0</span>
                <div className="flex flex-col gap-0.5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} className="h-3.5 w-3.5 fill-[#fbbc04] text-[#fbbc04]" />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground group-hover:text-gold transition-colors">
                    View on Google <ExternalLink className="inline h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          </motion.a>
        </div>

        {/* Reviews grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex flex-col justify-between rounded-2xl border border-border bg-white p-6 shadow-soft transition-all duration-300 hover:shadow-card"
            >
              <div>
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-charcoal text-xs font-bold text-white">
                      {review.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-charcoal">{review.name}</div>
                      <div className="text-xs text-muted-foreground">{review.location}</div>
                    </div>
                  </div>
                  {/* Google G small */}
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 opacity-40" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>

                {/* Stars + date */}
                <div className="mt-4 flex items-center gap-2">
                  <Stars count={review.rating} />
                  <span className="text-[11px] text-muted-foreground">{review.date}</span>
                </div>

                {/* Review text */}
                <p className="mt-3 text-sm leading-relaxed text-charcoal/75">
                  "{review.text}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-border bg-white px-8 py-10 text-center shadow-soft sm:flex-row sm:justify-between sm:text-left"
        >
          <div>
            <p className="text-lg font-bold text-charcoal">Had a great experience with us?</p>
            <p className="mt-1 text-sm text-muted-foreground">Your review helps others discover our service and motivates our team.</p>
          </div>
          <a
            href={WRITE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2.5 rounded-xl border border-[#4285F4]/20 bg-[#4285F4]/5 px-6 py-3.5 text-sm font-bold text-[#4285F4] transition-all duration-200 hover:border-[#4285F4]/40 hover:bg-[#4285F4]/10"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Write a Google Review
          </a>
        </motion.div>

      </div>
    </section>
  );
}
