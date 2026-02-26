import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedSection from "./AnimatedSection";

const steps = [
  {
    step: "1. Landing",
    action: "User searches for \"Physics\"",
    outcome: "Shows availability (2 Physical, 1 eBook).",
  },
  {
    step: "2. Auth",
    action: "User logs in via 2FA",
    outcome: "System identifies them as a Student.",
  },
  {
    step: "3. Action",
    action: "User clicks Reserve",
    outcome: "Admin gets notification; book status becomes Reserved.",
  },
  {
    step: "4. Admin",
    action: "Admin scans barcode",
    outcome: "Book is issued; user receives SMS/Email receipt.",
  },
];

const FlowSummary = () => {
  return (
    <section id="flow" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
            Data Flow Summary
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A frictionless journey from discovery to circulation management.
          </p>
        </AnimatedSection>

        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          {steps.map((item, index) => (
            <AnimatedSection key={item.step} delay={index * 100} animation="fade-up">
              <Card className="hover:shadow-lg transition-all h-full">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                      {item.step}
                    </p>
                  </div>
                  <p className="font-semibold text-foreground">{item.action}</p>
                  <p className="text-sm text-muted-foreground mt-2">{item.outcome}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlowSummary;
