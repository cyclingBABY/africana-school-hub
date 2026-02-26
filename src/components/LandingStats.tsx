import { Users, LibraryBig, BookOpenCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedSection from "./AnimatedSection";

const stats = [
  {
    label: "eBooks",
    value: "5,000+",
    icon: BookOpenCheck,
  },
  {
    label: "Physical Books",
    value: "12,000",
    icon: LibraryBig,
  },
  {
    label: "Active Members",
    value: "3,200",
    icon: Users,
  },
];

const LandingStats = () => {
  return (
    <section id="stats" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
            Live Library Stats
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A quick pulse on the growing digital and physical collections.
          </p>
        </AnimatedSection>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <AnimatedSection
              key={stat.label}
              delay={index * 100}
              animation={index % 2 === 0 ? "fade-left" : "fade-right"}
            >
              <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                    <stat.icon className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingStats;
