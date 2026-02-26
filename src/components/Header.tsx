import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Mail, UserCog, UserPlus } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const navLinks = [
    { label: "Home", href: isHomePage ? "#home" : "/" },
    { label: "Collections", href: isHomePage ? "#collections" : "/#collections" },
    { label: "Live Stats", href: isHomePage ? "#stats" : "/#stats" },
    { label: "Data Flow", href: isHomePage ? "#flow" : "/#flow" },
    { label: "Contact", href: isHomePage ? "#contact" : "/#contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4 flex flex-wrap justify-center md:justify-between items-center gap-2 text-sm">
          <div className="flex items-center gap-4">
            <a href="tel:0750492418" className="flex items-center gap-1 hover:text-accent transition-colors">
              <Phone className="w-3 h-3" />
              <span>0750 492418</span>
            </a>
            <a href="mailto:lms@ugandadigitallibrary.org" className="flex items-center gap-1 hover:text-accent transition-colors">
              <Mail className="w-3 h-3" />
              <span>lms@ugandadigitallibrary.org</span>
            </a>
          </div>
          <p className="hidden md:block font-medium italic">"Unlock knowledge for every reader"</p>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="#home" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full hero-gradient flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-xl">L</span>
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-foreground leading-tight">Uganda Digital Library</h1>
              <p className="text-xs text-muted-foreground">Modern Library Management</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-foreground hover:text-primary font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent hover:after:w-full after:transition-all"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/register"
              className="flex items-center gap-2 text-foreground hover:text-primary font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent hover:after:w-full after:transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Join the Library
            </Link>
            <Link
              to="/auth"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-all text-sm font-medium"
            >
              <UserCog className="w-4 h-4" />
              Member Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-foreground hover:text-primary font-medium transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 text-foreground hover:text-primary font-medium transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Join the Library
              </Link>
              <Link
                to="/auth"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 text-foreground hover:text-primary font-medium transition-colors"
              >
                <UserCog className="w-4 h-4" />
                Member Login
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
