import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { About } from "@/components/About";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Agra Taxis" },
      {
        name: "description",
        content:
          "Learn about Agra Taxis — Sri Lanka's trusted vehicle rental and taxi service. Professional drivers, islandwide coverage, available 24/7.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <PageHero
          image="/assets/hero.jpg"
          title="About Us"
          subtitle="Sri Lanka's trusted vehicle rental and taxi service — professional drivers, islandwide coverage, 24/7."
        />
        <About />
        <WhyChooseUs />
        <Testimonials />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
