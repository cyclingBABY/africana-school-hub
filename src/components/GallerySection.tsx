import { useState } from "react";
import { X } from "lucide-react";
import trip1 from "@/assets/trip-1.jpg";
import trip2 from "@/assets/trip-2.jpg";
import trip3 from "@/assets/trip-3.jpg";
import trip4 from "@/assets/trip-4.jpg";
import trip5 from "@/assets/trip-5.jpg";
import trip6 from "@/assets/trip-6.jpg";
import sports1 from "@/assets/sports-1.jpg";
import sports2 from "@/assets/sports-2.jpg";
import sports3 from "@/assets/sports-3.jpg";
import sports4 from "@/assets/sports-4.jpg";
import gallerySportsReal from "@/assets/gallery-sports-real.jpg";
import gallerySchoolTrip from "@/assets/gallery-school-trip.jpg";

const galleryImages = [
  {
    src: trip2,
    alt: "Students on school trip",
    title: "School Trip",
    description: "Students enjoying educational excursions by the lake",
  },
  {
    src: trip1,
    alt: "Students posing together",
    title: "Outdoor Learning",
    description: "Building friendships and memories beyond the classroom",
  },
  {
    src: sports4,
    alt: "League standings",
    title: "League Champions",
    description: "Africana Muslims leading the Sokolo League 2025",
  },
  {
    src: sports1,
    alt: "Football celebration",
    title: "Goal Celebration",
    description: "Our football team celebrating a winning goal",
  },
  {
    src: trip3,
    alt: "Group photo",
    title: "Class Trip",
    description: "Students on an educational excursion",
  },
  {
    src: sports2,
    alt: "Team huddle",
    title: "Team Spirit",
    description: "Unity and teamwork on the field",
  },
  {
    src: trip4,
    alt: "Boys at the lake",
    title: "Student Life",
    description: "Students enjoying outdoor activities",
  },
  {
    src: sports3,
    alt: "Fans cheering",
    title: "Fan Support",
    description: "Enthusiastic supporters at school matches",
  },
  {
    src: trip5,
    alt: "Students at beach",
    title: "Beach Trip",
    description: "Fun and learning at the waterfront",
  },
  {
    src: gallerySportsReal,
    alt: "Sports team",
    title: "Athletics",
    description: "Students excelling in sports programs",
  },
  {
    src: trip6,
    alt: "Class group photo",
    title: "Class Memories",
    description: "Creating lasting friendships and memories",
  },
  {
    src: gallerySchoolTrip,
    alt: "School excursion",
    title: "Excursion Day",
    description: "Educational trips for holistic development",
  },
];

const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <section id="gallery" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            School Gallery
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take a visual tour of our campus and discover the vibrant learning environment 
            at Africana Muslim Secondary School
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl bg-card shadow-md cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
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
          ))}
        </div>

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
                src={galleryImages[selectedImage].src}
                alt={galleryImages[selectedImage].alt}
                className="w-full h-full object-contain rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-6 rounded-b-lg">
                <h3 className="font-serif font-bold text-xl text-primary-foreground">
                  {galleryImages[selectedImage].title}
                </h3>
                <p className="text-primary-foreground/90">
                  {galleryImages[selectedImage].description}
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
