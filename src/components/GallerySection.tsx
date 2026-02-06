import { useState } from "react";
import { X } from "lucide-react";
import galleryClassroom from "@/assets/gallery-classroom.jpg";
import galleryCampus from "@/assets/gallery-campus.jpg";
import gallerySports from "@/assets/gallery-sports.jpg";
import galleryPrayer from "@/assets/gallery-prayer.jpg";
import galleryLab from "@/assets/gallery-lab.jpg";
import galleryLibrary from "@/assets/gallery-library.jpg";

const galleryImages = [
  {
    src: galleryCampus,
    alt: "School Campus",
    title: "Our Campus",
    description: "Modern facilities with Islamic architectural elements",
  },
  {
    src: galleryClassroom,
    alt: "Classroom",
    title: "Classrooms",
    description: "Well-equipped learning spaces for academic excellence",
  },
  {
    src: galleryLab,
    alt: "Science Laboratory",
    title: "Science Lab",
    description: "Hands-on experiments for practical learning",
  },
  {
    src: galleryLibrary,
    alt: "School Library",
    title: "Library",
    description: "Rich collection of academic and Islamic resources",
  },
  {
    src: galleryPrayer,
    alt: "Prayer Room",
    title: "Prayer Hall",
    description: "Dedicated space for spiritual development",
  },
  {
    src: gallerySports,
    alt: "Sports Activities",
    title: "Sports & Activities",
    description: "Physical education and extracurricular programs",
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
