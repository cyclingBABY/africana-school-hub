import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import trip1 from "@/assets/trip-1.jpg";
import trip2 from "@/assets/trip-2.jpg";
import trip3 from "@/assets/trip-3.jpg";
import trip4 from "@/assets/trip-4.jpg";
import trip5 from "@/assets/trip-5.jpg";
import trip6 from "@/assets/trip-6.jpg";

const tripImages = [
  {
    src: trip1,
    alt: "Students enjoying school trip",
  },
  {
    src: trip2,
    alt: "Group photo at the lake",
  },
  {
    src: trip3,
    alt: "Students posing together",
  },
  {
    src: trip4,
    alt: "Boys having fun",
  },
  {
    src: trip5,
    alt: "Students at the beach",
  },
  {
    src: trip6,
    alt: "Class trip memories",
  },
];

const SchoolTripSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % tripImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + tripImages.length) % tripImages.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            School Trip Adventures
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the joy of learning beyond the classroom through our educational excursions
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Main Slider */}
          <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            {tripImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-105"
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
              </div>
            ))}

            {/* Navigation Arrows */}
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

            {/* Slide counter */}
            <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-foreground">
                {currentSlide + 1} / {tripImages.length}
              </span>
            </div>
          </div>

          {/* Thumbnail navigation */}
          <div className="flex justify-center gap-2 mt-6 overflow-x-auto pb-2">
            {tripImages.map((image, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all duration-300 flex-shrink-0 ${
                  index === currentSlide
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SchoolTripSlider;
