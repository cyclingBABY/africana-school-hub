import { FileText, CreditCard, IdCard, Camera, FolderOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AdmissionSection = () => {
  const requirements = [
    { icon: FileText, label: "Admission Fee", amount: "50,000" },
    { icon: CreditCard, label: "Development Fee", amount: "50,000", note: "Per year" },
    { icon: IdCard, label: "Identity Card", amount: "10,000" },
    { icon: FolderOpen, label: "File", amount: "5,000" },
    { icon: Camera, label: "Passport Photos", amount: "10,000" },
  ];

  return (
    <section id="admission" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Admission Requirements
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            New students are required to pay a one-time admission package to secure their place at Africana Muslim Secondary School.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Total amount highlight */}
          <Card className="bg-primary text-primary-foreground mb-8 overflow-hidden">
            <CardContent className="p-8 text-center relative">
              <div className="absolute inset-0 geometric-pattern opacity-10" />
              <p className="text-lg mb-2 relative z-10">Total Initial Admission Fee</p>
              <div className="text-4xl md:text-5xl font-bold font-serif relative z-10">
                UGX <span className="text-accent">125,000</span>
              </div>
              <p className="text-primary-foreground/70 mt-2 relative z-10">One-time payment</p>
            </CardContent>
          </Card>

          {/* Breakdown */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requirements.map((item, index) => (
              <Card
                key={item.label}
                className="group hover:shadow-lg transition-all hover:-translate-y-1 border-border"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{item.label}</h3>
                      <p className="text-lg font-bold text-primary">UGX {item.amount}</p>
                      {item.note && (
                        <p className="text-xs text-muted-foreground mt-1">{item.note}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdmissionSection;
