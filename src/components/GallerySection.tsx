import { useState } from "react";
import { X, ImageOff } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import { useSiteMedia } from "@/hooks/useSiteMedia";

// Fallback static images for when database is empty
import trip1 from "@/assets/trip-1.jpg";
import trip2 from "@/assets/trip-2.jpg";
import sports1 from "@/assets/sports-1.jpg";
import sports4 from "@/assets/sports-4.jpg";

const fallbackImages = [
  { file_url: trip2, title: "School Trip", description: "Students enjoying educational excursions" },
  { file_url: trip1, title: "Outdoor Learning", description: "Building friendships beyond the classroom" },
  { file_url: sports4, title: "League Champions", description: "Africana Muslims leading the Sokolo League" },
  { file_url: sports1, title: "Goal Celebration", description: "Our football team celebrating" },
];

const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const { media: galleryImages, isLoading } = useSiteMedia("gallery");

  // Use database images or fallback to static
  const displayImages = galleryImages.length > 0 
    ? galleryImages.map(img => ({
        src: img.file_url,
        alt: img.title,
        title: img.title,
        description: img.description || "",
      }))
    : fallbackImages.map(img => ({
        src: img.file_url,
        alt: img.title,
        title: img.title,
        description: img.description,
      }));

  if (isLoading) {
    return (
      <section id="gallery" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              School Gallery
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            School Gallery
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take a visual tour of our campus and discover the vibrant learning environment 
            at Africana Muslim Secondary School
          </p>
        </AnimatedSection>

        {displayImages.length === 0 ? (
          <div className="text-center py-12">
            <ImageOff className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No gallery images available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayImages.map((image, index) => (
              <AnimatedSection 
                key={index} 
                animation={index % 3 === 0 ? 'fade-left' : index % 3 === 1 ? 'fade-up' : 'fade-right'}
                delay={index * 80}
              >
                <div
                  className="group relative overflow-hidden rounded-xl bg-card shadow-md cursor-pointer hover-lift image-zoom"
                  onClick={() => setSelectedImage(index)}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-primary-foreground">
                      <h3 className="font-serif font-bold text-lg">{image.title}</h3>
                      <p className="text-sm opacity-90">{image.description}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif font-semibold text-foreground">{image.title}</h3>
                    <p className="text-sm text-muted-foreground">{image.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedImage !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-primary-foreground hover:text-accent transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <div
              className="relative max-w-4xl max-h-[85vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={displayImages[selectedImage].src}
                alt={displayImages[selectedImage].alt}
                className="w-full h-full object-contain rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-6 rounded-b-lg">
                <h3 className="font-serif font-bold text-xl text-primary-foreground">
                  {displayImages[selectedImage].title}
                </h3>
                <p className="text-primary-foreground/90">
                  {displayImages[selectedImage].description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;