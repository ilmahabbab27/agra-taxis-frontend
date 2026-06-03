import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { BookingForm } from "@/components/BookingForm";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <PageHero
          image="/assets/luxury.jpg"
          title="Book a Vehicle"
          subtitle="Select your route and vehicle, check the fare estimate, and send your inquiry via WhatsApp."
        />
        <BookingForm />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
