import { MapPin, BookOpen, Star } from "lucide-react";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-32 pb-20">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 geometric-pattern opacity-30" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-primary-foreground/5 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/20 text-primary-foreground px-4 py-2 rounded-full mb-8 animate-fade-in">
            <Star className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Excellence in Education Since Establishment</span>
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Africana Muslim
            <span className="block text-accent mt-2">Secondary School</span>
          </h1>

          {/* Motto */}
          <p className="text-xl md:text-2xl text-primary-foreground/90 font-serif italic mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            "Attain Knowledge and Rise in Degree"
          </p>

          {/* Location */}
          <div className="flex items-center justify-center gap-2 text-primary-foreground/80 mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <MapPin className="w-5 h-5" />
            <span>Bombo Road, 5 miles, Kawempe, Uganda</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <a
              href="#admission"
              className="gold-gradient text-accent-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Apply Now
            </a>
            <a
              href="#fees"
              className="bg-primary-foreground/10 text-primary-foreground border-2 border-primary-foreground/30 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-foreground/20 transition-all"
            >
              View Fees Structure
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-1">S.1-S.6</div>
              <div className="text-primary-foreground/70 text-sm">Class Levels</div>
            </div>
            <div className="text-center border-x border-primary-foreground/20">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-1">Day</div>
              <div className="text-primary-foreground/70 text-sm">& Boarding</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-1">Quality</div>
              <div className="text-primary-foreground/70 text-sm">Education</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(40 33% 97%)"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
