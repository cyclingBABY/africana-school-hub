import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HeroSearch = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-1.5 focus-within:border-accent/50 focus-within:bg-white/15 transition-all">
        <Search className="w-5 h-5 text-primary-foreground/60 ml-3 flex-shrink-0" />
        <Input
          type="text"
          placeholder="Search by book title, author, or ISBN..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border-0 bg-transparent text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
        />
        <Button
          type="submit"
          className="gold-gradient text-accent-foreground hover:opacity-90 px-6 rounded-lg"
        >
          Search
        </Button>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {["Physics", "Mathematics", "Literature", "History", "Computer Science"].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setQuery(tag);
              navigate(`/catalog?q=${encodeURIComponent(tag)}`);
            }}
            className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-primary-foreground/80 hover:bg-white/20 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  );
};

export default HeroSearch;
