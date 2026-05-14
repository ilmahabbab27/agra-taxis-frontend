import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { BookingForm } from "@/components/BookingForm";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Book a Vehicle — Agra Taxis" },
      {
        name: "description",
        content:
          "Reserve your vehicle with Agra Taxis. Select your route, vehicle type and get an instant fare estimate. Send your inquiry via WhatsApp 24/7.",
      },
    ],
  }),
  component: BookingPage,
});

function BookingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <PageHero
          image="/assets/luxury.jpg"
          title="Book a Vehicle"
          subtitle="Select your route and vehicle, get an instant fare estimate, and send your inquiry via WhatsApp."
        />
        <BookingForm />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
