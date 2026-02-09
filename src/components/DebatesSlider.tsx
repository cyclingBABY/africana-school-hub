import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";
import { useSiteMedia } from "@/hooks/useSiteMedia";

const DebatesSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { media: debatesMedia, isLoading } = useSiteMedia("debates");

  const debatesImages = debatesMedia.length > 0
    ? debatesMedia.map(img => ({
        src: img.file_url,
        alt: img.title,
        caption: img.title,
      }))
    : [];

  const nextSlide = useCallback(() => {
    if (debatesImages.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % debatesImages.length);
  }, [debatesImages.length]);

  const prevSlide = useCallback(() => {
    if (debatesImages.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + debatesImages.length) % debatesImages.length);
  }, [debatesImages.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying || debatesImages.length === 0) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, debatesImages.length]);

  useEffect(() => {
    if (currentSlide >= debatesImages.length && debatesImages.length > 0) {
      setCurrentSlide(0);
    }
  }, [debatesImages.length, currentSlide]);

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Debates & Public Speaking
            </h2>
          </div>
          <div className="max-w-5xl mx-auto h-[400px] md:h-[500px] bg-muted animate-pulse rounded-2xl" />
        </div>
      </section>
    );
  }

  if (debatesImages.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Debates & Public Speaking
            </h2>
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Developing confident voices and critical thinkers through competitive debates and public speaking
          </p>
        </AnimatedSection>

        <AnimatedSection animation="scale" className="relative max-w-5xl mx-auto">
          <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            {debatesImages.map((image, index) => (
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
            {debatesImages.map((_, index) => (
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

export default DebatesSlider;
