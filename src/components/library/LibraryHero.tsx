import { useState } from "react";
import { Search, BookOpen, Users, Library } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LibraryHero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden hero-gradient">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Library className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">
            Africana Library Hub
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Your Gateway to Knowledge - Physical & Digital Collections
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by book title, ISBN, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-14 pr-4 text-lg rounded-full bg-white/95 backdrop-blur-sm border-0 text-foreground placeholder:text-muted-foreground"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                size="sm"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <BookOpen className="w-8 h-8 mx-auto mb-3 text-white" />
              <div className="text-3xl font-bold mb-1">12,000+</div>
              <div className="text-white/80">Physical Books</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Library className="w-8 h-8 mx-auto mb-3 text-white" />
              <div className="text-3xl font-bold mb-1">5,000+</div>
              <div className="text-white/80">Digital eBooks</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Users className="w-8 h-8 mx-auto mb-3 text-white" />
              <div className="text-3xl font-bold mb-1">2,500+</div>
              <div className="text-white/80">Active Members</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6 rounded-full"
              onClick={() => navigate('/register')}
            >
              Join the Library
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-full bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => navigate('/auth')}
            >
              Member Login
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LibraryHero;
