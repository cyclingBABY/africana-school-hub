import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";
import trip1 from "@/assets/trip-1.jpg";
import trip2 from "@/assets/trip-2.jpg";
import trip3 from "@/assets/trip-3.jpg";
import sports1 from "@/assets/sports-1.jpg";
import sports2 from "@/assets/sports-2.jpg";
import sports4 from "@/assets/sports-4.jpg";

const slides = [
  {
    image: trip2,
    title: "Welcome to Africana Muslim Secondary School",
    subtitle: "A Center of Academic Excellence",
    description: "Located along Bombo Road, Kawempe, we provide quality education in a nurturing Islamic environment.",
    highlight: "Established on the foundation of knowledge and faith",
  },
  {
    image: trip1,
    title: "Quality Education",
    subtitle: "From S.1 to S.6",
    description: "Our comprehensive curriculum covers both day and boarding programs, preparing students for academic success.",
    highlight: "Day scholars: UGX 500,000 | Boarding: UGX 1,000,000",
  },
  {
    image: trip3,
    title: "Educational Excursions",
    subtitle: "Learning Beyond Classroom",
    description: "Regular field trips and outdoor learning experiences to broaden students' horizons.",
    highlight: "Attain Knowledge and Rise in Degree",
  },
  {
    image: sports4,
    title: "Sports Excellence",
    subtitle: "Sokolo League Champions",
    description: "Our students excel in athletics, proudly leading the Schools League 2025 standings.",
    highlight: "1st Place - Africana Muslims with 13 points!",
  },
  {
    image: sports1,
    title: "Athletic Development",
    subtitle: "Physical Education",
    description: "Building character, teamwork, and healthy competition through sports programs.",
    highlight: "Building champions on and off the field",
  },
  {
    image: sports2,
    title: "Team Spirit",
    subtitle: "Unity & Strength",
    description: "Our teams celebrate victories together, fostering brotherhood and sportsmanship.",
    highlight: "Healthy body, healthy mind",
  },
];

const FeatureSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <section className="relative py-16 bg-card overflow-hidden">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Discover Our School
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the best of education, faith, and community at Africana Muslim Secondary School
          </p>
        </AnimatedSection>

        <AnimatedSection animation="scale" className="relative max-w-6xl mx-auto">
          {/* Main Slider */}
          <div className="relative h-[500px] md:h-[450px] rounded-2xl overflow-hidden shadow-2xl">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide
                    ? "opacity-100 translate-x-0"
                    : index < currentSlide
                    ? "opacity-0 -translate-x-full"
                    : "opacity-0 translate-x-full"
                }`}
              >
                {/* Background Image */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />

                {/* Content */}
                <div className="relative h-full flex items-center">
                  <div className="p-8 md:p-12 max-w-xl">
                    <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-full mb-4 animate-fade-in">
                      {slide.subtitle}
                    </span>
                    <h3 className="font-serif text-2xl md:text-4xl font-bold text-primary-foreground mb-4">
                      {slide.title}
                    </h3>
                    <p className="text-primary-foreground/90 text-base md:text-lg mb-6">
                      {slide.description}
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-lg border border-primary-foreground/20">
                      <span className="text-primary-foreground font-medium text-sm md:text-base">
                        {slide.highlight}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

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

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
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

export default FeatureSlider;
