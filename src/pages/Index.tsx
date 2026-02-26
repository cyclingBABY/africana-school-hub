import LibraryHero from "@/components/library/LibraryHero";
import FeaturedCollections from "@/components/library/FeaturedCollections";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <main>
        <LibraryHero />
        <FeaturedCollections type="new_arrivals" />
        <FeaturedCollections type="trending" />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
