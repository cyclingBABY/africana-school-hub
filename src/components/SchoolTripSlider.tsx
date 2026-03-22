import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";
import { useSiteMedia } from "@/hooks/useSiteMedia";
// import trip1 from "@/assets/trip-1.jpg";
import trip2 from "@/assets/trip-2.jpg";
import trip3 from "@/assets/trip-3.jpg";
import trip6 from "@/assets/trip-6.jpg";

const fallbackImages = [
  {
    src: trip2,
    alt: "Students gathered during an educational school trip",
    caption: "Educational Excursions",
  },
  {
    src: trip6,
    alt: "Students exploring and learning outside the classroom",
    caption: "Learning Beyond the Classroom",
  },
  {
    src: trip3,
    alt: "Students enjoying a group outing together",
    caption: "Shared Discovery",
  },
  {
    src: trip6,
    alt: "Students participating in a school trip activity",
    caption: "Memorable Experiences",
  },
];

const SchoolTripSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { media: tripMedia, isLoading } = useSiteMedia("events");

  const tripImages = tripMedia.length > 0
    ? tripMedia.map((img) => ({
        src: img.file_url,
        alt: img.title,
        caption: img.title,
      }))
    : fallbackImages;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % tripImages.length);
  }, [tripImages.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + tripImages.length) % tripImages.length);
  }, [tripImages.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying || tripImages.length === 0) return;

    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, tripImages.length]);

  useEffect(() => {
    if (currentSlide >= tripImages.length) {
      setCurrentSlide(0);
    }
  }, [tripImages.length, currentSlide]);

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Educational Trips & Excursions
            </h2>
          </div>
          <div className="max-w-5xl mx-auto h-[400px] md:h-[500px] bg-muted animate-pulse rounded-2xl" />
        </div>
      </section>
    );
  }

  if (tripImages.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <Map className="h-8 w-8 text-primary" />
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Educational Trips & Excursions
            </h2>
            <Map className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Expanding horizons through field experiences, shared adventures, and real-world learning moments.
          </p>
        </AnimatedSection>

        <AnimatedSection animation="scale" className="relative max-w-5xl mx-auto">
          <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-card">
            {tripImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="inline-block px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg">
                    {image.caption}
                  </span>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm hover:bg-card border-border z-10"
              onClick={() => {
                prevSlide();
                setIsAutoPlaying(false);
                setTimeout(() => setIsAutoPlaying(true), 5000);
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm hover:bg-card border-border z-10"
              onClick={() => {
                nextSlide();
                setIsAutoPlaying(false);
                setTimeout(() => setIsAutoPlaying(true), 5000);
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex justify-center gap-3 mt-6">
            {tripImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-10 bg-primary"
                    : "w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default SchoolTripSlider;
