import { Shirt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import uniformFull from "@/assets/uniform-full.png";

const UniformSection = () => {
  const girlsItems = [
    "2 Navy Blue Skirts",
    "2 White Polo Shirts (blue trim)",
    "Hijab/Veil",
    "School Beanie Cap",
    "Black Hoodie/Sweater",
  ];

  const girlsBoardingExtra = ["Boarding T-shirts", "Boarding Skirts"];

  const boysItems = [
    "2 Navy Blue Trousers",
    "2 White Polo Shirts (blue trim)",
    "School Beanie Cap",
    "Black Hoodie/Sweater",
  ];

  const boysBoardingExtra = ["Boarding T-shirts"];

  return (
    <section id="uniforms" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Uniform Package
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete uniform packages are available for both day scholars and boarding students.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
          <Card className="text-center hover:shadow-xl transition-shadow border-2 border-secondary">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-xl text-foreground">Day Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">UGX 225,000</div>
              <p className="text-sm text-muted-foreground">Complete uniform set</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-xl transition-shadow border-2 border-primary bg-primary/5">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-xl text-foreground">Boarding Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">UGX 285,000</div>
              <p className="text-sm text-muted-foreground">Complete uniform set + boarding attire</p>
            </CardContent>
          </Card>
        </div>

        {/* Uniform Details */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Girls */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-secondary">
              <CardTitle className="flex items-center gap-3 font-serif">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Shirt className="w-5 h-5 text-primary-foreground" />
                </div>
                Girls Uniform
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6">
                <ul className="space-y-2">
                  {girlsItems.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Boarding students also receive:
                  </p>
                  <ul className="space-y-1">
                    {girlsBoardingExtra.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boys */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-secondary">
              <CardTitle className="flex items-center gap-3 font-serif">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Shirt className="w-5 h-5 text-primary-foreground" />
                </div>
                Boys Uniform
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Uniform Image */}
              <div className="aspect-square overflow-hidden bg-muted">
                <img 
                  src={uniformBoys} 
                  alt="Boys school uniform with white shirt, green tie, navy trousers and sweater"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              <div className="p-6">
                <ul className="space-y-2">
                  {boysItems.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Boarding students also receive:
                  </p>
                  <ul className="space-y-1">
                    {boysBoardingExtra.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default UniformSection;
