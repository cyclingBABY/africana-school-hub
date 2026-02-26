import { Link } from "react-router-dom";
import LibraryHeader from "@/components/library/LibraryHeader";
import LibraryFooter from "@/components/library/LibraryFooter";
import HeroSearch from "@/components/library/HeroSearch";
import StatsCounter from "@/components/library/StatsCounter";
import FeaturedCollections from "@/components/library/FeaturedCollections";
import { mockStats } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

const LibraryHome = () => {
  return (
    <div className="min-h-screen">
      <LibraryHeader />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-32 pb-20">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 geometric-pattern opacity-20" />
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-primary-foreground/5 blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-primary-foreground px-4 py-2 rounded-full mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
              <span className="text-sm font-medium">
                Uganda&apos;s Modern Library Experience
              </span>
            </div>

            <h1
              className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Discover, Borrow &amp;
              <span className="block text-accent mt-2">Read Anywhere</span>
            </h1>

            <p
              className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Access thousands of physical books and eBooks from Kampala&apos;s
              premier library. Search, reserve, and read — all from one place.
            </p>

            <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <HeroSearch />
            </div>

            {/* Live Stats */}
            <div
              className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto animate-fade-in"
              style={{ animationDelay: "0.5s" }}
            >
              <StatsCounter end={mockStats.totalEbooks} label="eBooks" suffix="+" />
              <div className="border-x border-primary-foreground/20">
                <StatsCounter end={mockStats.totalPhysicalBooks} label="Physical Books" suffix="+" />
              </div>
              <StatsCounter end={mockStats.totalMembers} label="Active Members" suffix="+" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="hsl(40 33% 97%)"
            />
          </svg>
        </div>
      </section>

      {/* Featured Collections */}
      <FeaturedCollections />

      {/* How It Works */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
              How It Works
            </h2>
            <div className="section-divider mb-4" />
            <p className="text-muted-foreground max-w-xl mx-auto">
              Getting started with Kampala Library is simple
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Search",
                desc: "Find any book by title, author, or ISBN from our catalog of 17,000+ resources.",
              },
              {
                step: "2",
                title: "Register",
                desc: "Create your free membership account in under 2 minutes.",
              },
              {
                step: "3",
                title: "Reserve",
                desc: "Reserve physical books or instantly access eBooks from your dashboard.",
              },
              {
                step: "4",
                title: "Read",
                desc: "Pick up at the desk or read digitally with our built-in reader.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center bg-card rounded-xl p-6 border border-border hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-full hero-gradient flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold text-lg">{item.step}</span>
                </div>
                <h3 className="font-serif font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / CTA */}
      <section id="about" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
                Kampala&apos;s Premier Library
              </h2>
              <div className="section-divider mb-6 !mx-0" />
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We are committed to providing accessible, high-quality educational
                resources to students, researchers, and lifelong learners across
                Uganda. Our collection spans science, mathematics, literature,
                history, and much more.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                With both physical and digital formats, you can borrow books at
                our Kawempe location or read eBooks from anywhere using our
                integrated digital reader.
              </p>
              <div className="flex gap-3">
                <Link to="/register">
                  <Button>Join the Library</Button>
                </Link>
                <Link to="/catalog">
                  <Button variant="outline">Browse Catalog</Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-5 border border-border text-center">
                <div className="text-2xl font-bold text-primary mb-1">17K+</div>
                <div className="text-sm text-muted-foreground">Total Resources</div>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border text-center">
                <div className="text-2xl font-bold text-primary mb-1">10+</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border text-center">
                <div className="text-2xl font-bold text-primary mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Digital Access</div>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border text-center">
                <div className="text-2xl font-bold text-primary mb-1">Free</div>
                <div className="text-sm text-muted-foreground">Membership</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LibraryFooter />
    </div>
  );
};

export default LibraryHome;
