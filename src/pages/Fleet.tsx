import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { Fleet } from "@/components/Fleet";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export default function FleetPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <PageHero
          image="/assets/van.jpg"
          title="Our Vehicles"
          subtitle="Cars, vans, SUVs, luxury vehicles, and buses with AC and Non-AC options."
        />
        <Fleet />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
