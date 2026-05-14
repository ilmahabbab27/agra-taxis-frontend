import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { Fleet } from "@/components/Fleet";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export const Route = createFileRoute("/fleet")({
  head: () => ({
    meta: [
      { title: "Our Vehicles — Agra Taxis" },
      {
        name: "description",
        content:
          "Browse Agra Taxis' full fleet — cars, vans, SUVs, luxury vehicles and buses. AC and Non-AC options with transparent per-km pricing.",
      },
    ],
  }),
  component: FleetPage,
});

function FleetPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <PageHero
          image="/assets/van.jpg"
          title="Our Vehicles"
          subtitle="Cars, vans, SUVs, luxury vehicles and buses — AC & Non-AC with transparent per-km pricing."
        />
        <Fleet />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
