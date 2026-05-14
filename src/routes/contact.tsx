import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Agra Taxis" },
      {
        name: "description",
        content:
          "Get in touch with Agra Taxis. Call, WhatsApp, or email us. We're available 24/7 for your transport needs across Sri Lanka.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <PageHero
          image="/assets/suv.jpg"
          title="Contact Us"
          subtitle="Available 24/7 — call, WhatsApp or email us to plan your journey."
        />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
