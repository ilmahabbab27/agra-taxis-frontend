import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <PageHero
          image="/assets/suv.jpg"
          title="Contact Us"
          subtitle="Available 24/7. Call, WhatsApp, or email us to plan your journey."
        />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
