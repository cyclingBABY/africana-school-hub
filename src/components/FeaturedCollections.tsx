import { BookOpen, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import AnimatedSection from "./AnimatedSection";

const newArrivals = [
  {
    title: "Digital Innovation in East Africa",
    author: "Grace K.",
    badge: "eBook",
  },
  {
    title: "Kampala City Archives",
    author: "Heritage Press",
    badge: "Print",
  },
  {
    title: "Swahili Poetry Collection",
    author: "M. Nsubuga",
    badge: "Audio",
  },
  {
    title: "STEM Pathways for Youth",
    author: "Library Lab",
    badge: "eBook",
  },
];

const trending = [
  {
    title: "Entrepreneurship in Uganda",
    author: "C. Namara",
    badge: "Print",
  },
  {
    title: "Climate Resilience Toolkit",
    author: "Open Earth",
    badge: "eBook",
  },
  {
    title: "Kampala Heritage Walk",
    author: "City Guides",
    badge: "Audio",
  },
  {
    title: "Modern Choir Arrangements",
    author: "Digital Arts",
    badge: "eBook",
  },
];

const FeaturedCollections = () => {
  return (
    <section id="collections" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
            Featured Collections
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse new arrivals and trending titles curated for Uganda readers.
          </p>
        </AnimatedSection>

        <div className="space-y-10">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">New Arrivals</h3>
              </div>
              <span className="text-sm text-muted-foreground">Swipe to explore</span>
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4">
                {newArrivals.map((item) => (
                  <Card key={item.title} className="min-w-[220px] hover:shadow-lg transition-all">
                    <CardContent className="pt-6 pb-6">
                      <span className="text-xs uppercase tracking-wide text-primary font-semibold">
                        {item.badge}
                      </span>
                      <h4 className="font-serif text-lg font-semibold text-foreground mt-2">
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{item.author}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">Trending in Kampala</h3>
              </div>
              <span className="text-sm text-muted-foreground">Updated weekly</span>
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4">
                {trending.map((item) => (
                  <Card key={item.title} className="min-w-[220px] hover:shadow-lg transition-all">
                    <CardContent className="pt-6 pb-6">
                      <span className="text-xs uppercase tracking-wide text-primary font-semibold">
                        {item.badge}
                      </span>
                      <h4 className="font-serif text-lg font-semibold text-foreground mt-2">
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{item.author}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
