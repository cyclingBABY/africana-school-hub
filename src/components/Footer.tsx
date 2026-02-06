import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <span className="font-serif font-bold text-lg">A</span>
            </div>
            <div>
              <h3 className="font-serif font-bold">Africana Muslim Secondary School</h3>
              <p className="text-sm text-primary-foreground/70">Bombo Road, Kawempe, Uganda</p>
            </div>
          </div>

          <p className="text-primary-foreground/70 text-sm italic mb-4">
            "Attain Knowledge and Rise in Degree"
          </p>

          <div className="border-t border-primary-foreground/20 pt-4 mt-4">
            <p className="text-sm text-primary-foreground/60 flex items-center justify-center gap-1">
              Made with <Heart className="w-4 h-4 text-accent fill-accent" /> for quality education
            </p>
            <p className="text-xs text-primary-foreground/40 mt-2">
              © {new Date().getFullYear()} Africana Muslim Secondary School. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
