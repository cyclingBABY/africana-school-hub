import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import LibraryHeader from "@/components/library/LibraryHeader";
import LibraryFooter from "@/components/library/LibraryFooter";
import BookCard from "@/components/library/BookCard";
import { mockBooks, bookCategories } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import type { Book } from "@/lib/types";

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFormat, setSelectedFormat] = useState<"all" | "physical" | "digital">("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredBooks = useMemo(() => {
    return mockBooks.filter((book) => {
      const matchesQuery =
        !query ||
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        book.isbn.includes(query) ||
        book.category.toLowerCase().includes(query.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || book.category === selectedCategory;

      const matchesFormat =
        selectedFormat === "all" || book.format === selectedFormat;

      return matchesQuery && matchesCategory && matchesFormat;
    });
  }, [query, selectedCategory, selectedFormat]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
  };

  const handleReserve = (book: Book) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to reserve books.",
      });
      navigate("/auth");
      return;
    }
    toast({
      title: "Book Reserved!",
      description: `"${book.title}" has been reserved. Pick it up at the front desk.`,
    });
  };

  const handleRead = (book: Book) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to read digital books.",
      });
      navigate("/auth");
      return;
    }
    toast({
      title: "Opening Reader",
      description: `Loading "${book.title}"...`,
    });
  };

  const physicalCount = filteredBooks.filter((b) => b.format === "physical").length;
  const digitalCount = filteredBooks.filter((b) => b.format === "digital").length;

  return (
    <div className="min-h-screen flex flex-col">
      <LibraryHeader />

      <main className="flex-1 pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              Book Catalog
            </h1>
            <p className="text-muted-foreground">
              Browse our collection of {mockBooks.length.toLocaleString()}+ books
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, author, ISBN, or category..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="bg-card rounded-xl p-4 border border-border mb-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                  {bookCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Format</p>
                <div className="flex gap-2">
                  {(["all", "physical", "digital"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setSelectedFormat(fmt)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                        selectedFormat === fmt
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {fmt === "all" ? "All Formats" : fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {filteredBooks.length} results
              </span>
              {query && (
                <Badge variant="secondary" className="text-xs">
                  &quot;{query}&quot;
                  <button
                    onClick={() => {
                      setQuery("");
                      setSearchParams({});
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>{physicalCount} Physical</span>
              <span>|</span>
              <span>{digitalCount} eBooks</span>
            </div>
          </div>

          {/* Book Grid */}
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onReserve={handleReserve}
                  onRead={handleRead}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                No books found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("All");
                  setSelectedFormat("all");
                  setSearchParams({});
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <LibraryFooter />
    </div>
  );
};

export default Catalog;
