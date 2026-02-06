import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ContactSection = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Numbers",
      details: ["0750 492418", "0707 002012", "0779 273134"],
    },
    {
      icon: Mail,
      title: "Email Address",
      details: ["africanamuslim@gmail.com"],
    },
    {
      icon: MapPin,
      title: "Location",
      details: ["Bombo Road, 5 miles", "Kawempe, Uganda"],
    },
    {
      icon: Clock,
      title: "Office Hours",
      details: ["Monday - Friday: 8:00 AM - 5:00 PM", "Saturday: 9:00 AM - 1:00 PM"],
    },
  ];

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Contact Us
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions about admissions or our programs? We're here to help. Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {contactInfo.map((item, index) => (
            <Card
              key={item.title}
              className="text-center hover:shadow-lg transition-all hover:-translate-y-1 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="pt-6 pb-6">
                <div className="w-14 h-14 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center group-hover:bg-primary transition-colors">
                  <item.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-serif font-semibold text-lg text-foreground mb-3">{item.title}</h3>
                <div className="space-y-1">
                  {item.details.map((detail, detailIndex) => (
                    <p key={detailIndex} className="text-muted-foreground text-sm">
                      {item.icon === Phone ? (
                        <a href={`tel:${detail.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
                          {detail}
                        </a>
                      ) : item.icon === Mail ? (
                        <a href={`mailto:${detail}`} className="hover:text-primary transition-colors">
                          {detail}
                        </a>
                      ) : (
                        detail
                      )}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 max-w-3xl mx-auto">
          <Card className="overflow-hidden">
            <div className="hero-gradient p-8 md:p-12 text-center relative">
              <div className="absolute inset-0 geometric-pattern opacity-10" />
              <div className="relative z-10">
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                  Ready to Join Our Community?
                </h3>
                <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                  Take the first step towards a quality education rooted in Islamic values and academic excellence.
                </p>
                <a
                  href="tel:0750492418"
                  className="inline-flex items-center gap-2 gold-gradient text-accent-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg"
                >
                  <Phone className="w-5 h-5" />
                  Call Now to Enquire
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
