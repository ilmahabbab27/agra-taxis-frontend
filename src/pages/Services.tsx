import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { Services } from "@/components/Services";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <PageHero
          image="/assets/car.jpg"
          title="Our Services"
          subtitle="Airport transfers, tours, weddings, corporate transport, and more across Sri Lanka."
        />
        <Services />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
