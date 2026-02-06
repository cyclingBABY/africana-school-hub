import { Book, Shirt as ClothingIcon, BedDouble, Sparkles, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedSection from "./AnimatedSection";

const RequirementsSection = () => {
  const categories = [
    {
      icon: Book,
      title: "Religious Texts",
      items: [
        "Quran (for Muslim students)",
        "Holy Bible (for Christian students)",
      ],
    },
    {
      icon: ClothingIcon,
      title: "Clothing",
      items: [
        "Black Sharia (girls)",
        "White Kanzu (boys)",
        "Black shoes",
        "Sandals",
      ],
    },
    {
      icon: BedDouble,
      title: "Bedding",
      items: [
        "Mattress",
        "Suitcase",
        "2 pairs of bed sheets",
        "Blanket",
        "Mosquito net",
      ],
    },
    {
      icon: Sparkles,
      title: "Hygiene Items",
      items: [
        "2 bottles of Jik (girls)",
        "3 packets of sanitary pads",
        "3 bars washing soap",
        "2 bars bathing soap",
        "20L jerrycan",
      ],
    },
    {
      icon: Package,
      title: "Other Essentials",
      items: [
        "Eating utensils (plate, cup, spoon)",
        "At least 4kg of sugar",
        "Flat iron",
        "Torch/flashlight",
      ],
    },
  ];

  return (
    <section id="requirements" className="py-20 bg-secondary/30 geometric-pattern">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Personal Requirements
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            All students are required to bring the following personal items for a comfortable stay at the school.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <AnimatedSection
              key={category.title}
              animation={index % 3 === 0 ? 'fade-left' : index % 3 === 1 ? 'fade-up' : 'fade-right'}
              delay={index * 100}
            >
              <Card className="hover:shadow-lg transition-all hover-lift h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <category.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="font-serif text-lg text-foreground">{category.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RequirementsSection;
