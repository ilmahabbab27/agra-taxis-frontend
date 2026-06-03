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
import { FareStripe } from "@/components/FareStripe";

export default function Index() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SplashScreen />
      <Navbar />
      <main>
        <Hero />
        <FareStripe />
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
