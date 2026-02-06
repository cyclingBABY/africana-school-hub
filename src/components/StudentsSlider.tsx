import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import students1 from "@/assets/students-1.jpg";
import students2 from "@/assets/students-2.jpg";
import students3 from "@/assets/students-3.jpg";
import students4 from "@/assets/students-4.jpg";

const studentImages = [
  {
    src: students1,
    alt: "Students with EAC flag",
    caption: "East African Community Pride",
  },
  {
    src: students2,
    alt: "Students in Islamic attire",
    caption: "Cultural Heritage",
  },
  {
    src: students3,
    alt: "Students on campus",
    caption: "Campus Life",
  },
  {
    src: students4,
    alt: "Students at event",
    caption: "Community Engagement",
  },
];

const StudentsSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % studentImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + studentImages.length) % studentImages.length);
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
          <div className="inline-flex items-center gap-2 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Our Students
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Meet the vibrant community of learners who make Africana Muslim Secondary School special
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Slider */}
          <div className="relative h-[450px] md:h-[550px] rounded-2xl overflow-hidden shadow-2xl">
            {studentImages.map((image, index) => (
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
                  className="w-full h-full object-cover object-top"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                
                {/* Caption */}
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="inline-block px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg">
                    {image.caption}
                  </span>
                </div>
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
          </div>

          {/* Dots navigation */}
          <div className="flex justify-center gap-3 mt-6">
            {studentImages.map((_, index) => (
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
        </div>
      </div>
    </section>
  );
};

export default StudentsSlider;
