import Navbar from "@/components/Layout/Navbar";
import HeroBanner from "@/components/Home/HeroBanner";
import Benefits from "@/components/Common/Benefits";
import KeyFeatures from "@/components/Common/KeyFeatures";
import LiveDashboard from "@/components/Common/LiveDashboard";
import Users from "@/components/Common/Users";
import Testimonials from "@/components/Common/Testimonials";
import PricingPlans from "@/components/Common/PricingPlans";
import Cta from "@/components/Common/Cta";
import Footer from "@/components/Layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      
      <div className="overflow-hidden">
        <HeroBanner />
        <Benefits />
        <div id="features">
          <KeyFeatures />
        </div>
        <div id="how-it-works">
          <LiveDashboard />
        </div>
        <Users />
        <Testimonials />
        <div id="pricing">
          <PricingPlans />
        </div>
        <Cta />
      </div>

      <Footer />
    </>
  );
}
