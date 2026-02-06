import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeatureSlider from "@/components/FeatureSlider";
import AdmissionSection from "@/components/AdmissionSection";
import FeesSection from "@/components/FeesSection";
import UniformSection from "@/components/UniformSection";
import RequirementsSection from "@/components/RequirementsSection";
import GallerySection from "@/components/GallerySection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <FeatureSlider />
        <AdmissionSection />
        <FeesSection />
        <UniformSection />
        <RequirementsSection />
        <GallerySection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
