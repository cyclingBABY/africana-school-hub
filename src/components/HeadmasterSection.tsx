import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import headmasterImage from "@/assets/headmaster.png";
import AnimatedSection from "./AnimatedSection";

const HeadmasterSection = () => {
  return (
    <section id="headmaster" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Message from the Headmaster
          </h2>
          <div className="section-divider mb-6" />
        </AnimatedSection>

        <AnimatedSection animation="scale" className="max-w-4xl mx-auto">
          <Card className="overflow-hidden hover-lift">
            <CardContent className="p-0">
              <div className="md:flex">
                {/* Headmaster Photo */}
                <div className="md:w-1/3 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-6">
                  <div className="w-48 h-64 rounded-lg overflow-hidden border-4 border-accent shadow-lg transition-transform duration-500 hover:scale-105">
                    <img 
                      src={headmasterImage} 
                      alt="Headmaster of Africana Muslim Secondary School"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>

                {/* Message Content */}
                <div className="md:w-2/3 p-8 md:p-10">
                  <Quote className="w-10 h-10 text-accent mb-4" />
                  
                  <blockquote className="text-muted-foreground leading-relaxed mb-6 space-y-4">
                    <p>
                      Assalamu Alaikum Warahmatullahi Wabarakatuh,
                    </p>
                    <p>
                      Welcome to Africana Muslim Secondary School. Our institution stands as a beacon of 
                      academic excellence rooted in Islamic values. We are committed to nurturing students 
                      who will excel both in their studies and in their faith.
                    </p>
                    <p>
                      At Africana Muslim, we believe that education is not merely about acquiring knowledge, 
                      but about developing character, discipline, and a sense of responsibility towards 
                      our community and the Ummah at large.
                    </p>
                    <p>
                      We invite you to join our family and embark on a journey of growth, learning, 
                      and spiritual development.
                    </p>
                  </blockquote>

                  <div className="border-t border-border pt-4">
                    <p className="font-serif font-semibold text-foreground text-lg">
                      The Headmaster
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Africana Muslim Secondary School
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default HeadmasterSection;
