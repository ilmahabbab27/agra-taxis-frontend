import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { Services } from "@/components/Services";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Our Services - Agra Taxis" },
      {
        name: "description",
        content:
          "Airport transfers, tour packages, wedding transport, staff transport, corporate services and more. Book with Agra Taxis across Sri Lanka.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
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
