import { Link } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Hero = () => {
  return (
    <section id="home" className="relative overflow-hidden pt-32 pb-20">
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 geometric-pattern opacity-30" />

      <div className="absolute -top-10 right-10 w-64 h-64 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-primary-foreground/5 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-primary-foreground px-4 py-2 rounded-full mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Modern Library Management for Uganda</span>
          </div>

          <h1
            className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Discover, Borrow, and Learn
            <span className="block text-accent mt-2">Across Our Digital Library</span>
          </h1>

          <p
            className="text-xl md:text-2xl text-primary-foreground/90 font-serif italic mb-10 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Search instantly by title, author, or ISBN — your library Google.
          </p>

          <div
            className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-2xl p-4 md:p-6 shadow-xl animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 bg-background/80 rounded-xl px-4 py-3">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Search by book title, author, or ISBN"
                />
              </div>
              <Button size="lg" className="w-full md:w-auto">
                Search Library
              </Button>
            </div>
            <p className="text-sm text-primary-foreground/70 mt-3">
              Showing availability of physical books and eBooks in real time.
            </p>
          </div>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <Link
              to="/register"
              className="gold-gradient text-accent-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg"
            >
              Join the Library
            </Link>
            <Link
              to="/auth"
              className="bg-primary-foreground/10 text-primary-foreground border-2 border-primary-foreground/30 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-foreground/20 transition-all"
            >
              Member Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
