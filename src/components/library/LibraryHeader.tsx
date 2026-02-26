import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

const LibraryHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <span className="hidden md:block font-medium">
            Kampala&apos;s Premier Digital &amp; Physical Library
          </span>
          <div className="flex items-center gap-4 mx-auto md:mx-0">
            <span>Mon-Sat: 8:00 AM - 8:00 PM EAT</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">+256 750 492418</span>
          </div>
        </div>
      </div>

      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg hero-gradient flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-xl">L</span>
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-foreground leading-tight">
                Kampala Library
              </h1>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <Link
              to="/"
              className="text-foreground hover:text-primary font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/catalog"
              className="text-foreground hover:text-primary font-medium transition-colors"
            >
              Catalog
            </Link>
            {isHome && (
              <a
                href="#collections"
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                Collections
              </a>
            )}
            {isHome && (
              <a
                href="#about"
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                About
              </a>
            )}

            {user ? (
              <Link to={user.role === "admin" ? "/admin" : "/dashboard"}>
                <Button size="sm">
                  {user.role === "admin" ? "Admin Panel" : "My Library"}
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/register">
                  <Button variant="outline" size="sm">
                    Join Library
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm">Member Login</Button>
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-foreground"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4 flex flex-col gap-3">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-foreground font-medium">
              Home
            </Link>
            <Link to="/catalog" onClick={() => setIsMenuOpen(false)} className="text-foreground font-medium">
              Catalog
            </Link>
            {user ? (
              <Link
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                onClick={() => setIsMenuOpen(false)}
              >
                <Button className="w-full" size="sm">
                  {user.role === "admin" ? "Admin Panel" : "My Library"}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full" size="sm">
                    Join Library
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full" size="sm">
                    Member Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default LibraryHeader;
