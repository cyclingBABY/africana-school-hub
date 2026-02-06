import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeatureSlider from "@/components/FeatureSlider";
import AdmissionSection from "@/components/AdmissionSection";
import SchoolTripSlider from "@/components/SchoolTripSlider";
import FeesSection from "@/components/FeesSection";
import SportsSlider from "@/components/SportsSlider";
import UniformSection from "@/components/UniformSection";
import RequirementsSection from "@/components/RequirementsSection";
import GallerySection from "@/components/GallerySection";
import HeadmasterSection from "@/components/HeadmasterSection";
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
        <SchoolTripSlider />
        <FeesSection />
        <SportsSlider />
        <UniformSection />
        <RequirementsSection />
        <GallerySection />
        <HeadmasterSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
