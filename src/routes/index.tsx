import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Fleet } from "@/components/Fleet";
import { BookingForm } from "@/components/BookingForm";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Testimonials } from "@/components/Testimonials";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { SplashScreen } from "@/components/SplashScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agra Taxis - Reliable Vehicle Rental & Taxi Service in Sri Lanka" },
      {
        name: "description",
        content:
          "Agra Taxis offers islandwide vehicle rental and taxi service in Sri Lanka. Airport transfers, tours, weddings, staff transport. Book via WhatsApp 24/7.",
      },
      { property: "og:title", content: "Agra Taxis - Sri Lanka's Trusted Transport Service" },
      { property: "og:description", content: "Islandwide taxi & vehicle rental. AC vans, cars, SUVs, luxury & buses. Call 072 300 3000." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&family=Noto+Sans+Sinhala:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SplashScreen />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Fleet />
        <BookingForm />
        <WhyChooseUs />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
