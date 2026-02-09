import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";
import { useSiteMedia } from "@/hooks/useSiteMedia";

const MDDSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { media: mddMedia, isLoading } = useSiteMedia("mdd");

  const mddImages = mddMedia.length > 0
    ? mddMedia.map(img => ({
        src: img.file_url,
        alt: img.title,
        caption: img.title,
      }))
    : [];

  const nextSlide = useCallback(() => {
    if (mddImages.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % mddImages.length);
  }, [mddImages.length]);

  const prevSlide = useCallback(() => {
    if (mddImages.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + mddImages.length) % mddImages.length);
  }, [mddImages.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying || mddImages.length === 0) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, mddImages.length]);

  useEffect(() => {
    if (currentSlide >= mddImages.length && mddImages.length > 0) {
      setCurrentSlide(0);
    }
  }, [mddImages.length, currentSlide]);

  if (isLoading) {
    return (
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Music, Dance & Drama
            </h2>
          </div>
          <div className="max-w-5xl mx-auto h-[400px] md:h-[500px] bg-muted animate-pulse rounded-2xl" />
        </div>
      </section>
    );
  }

  if (mddImages.length === 0) {
    return (
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <Music className="h-8 w-8 text-primary" />
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Music, Dance & Drama
              </h2>
              <Music className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Celebrating creativity and talent through performing arts at Africana Muslim Secondary School
            </p>
          </AnimatedSection>
          <AnimatedSection animation="scale" className="max-w-5xl mx-auto">
            <div className="h-[300px] md:h-[400px] rounded-2xl bg-muted/50 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
              <p className="text-muted-foreground text-lg">Photos coming soon...</p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <Music className="h-8 w-8 text-primary" />
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Music, Dance & Drama
            </h2>
            <Music className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Celebrating creativity and talent through performing arts at Africana Muslim Secondary School
          </p>
        </AnimatedSection>

        <AnimatedSection animation="scale" className="relative max-w-5xl mx-auto">
          <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            {mddImages.map((image, index) => (
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
            {mddImages.map((_, index) => (
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

export default MDDSlider;
