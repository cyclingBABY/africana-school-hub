import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AdmissionSection from "@/components/AdmissionSection";
import FeesSection from "@/components/FeesSection";
import UniformSection from "@/components/UniformSection";
import RequirementsSection from "@/components/RequirementsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <AdmissionSection />
        <FeesSection />
        <UniformSection />
        <RequirementsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
