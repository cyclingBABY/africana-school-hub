import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Book, LibraryStatistics, PopularBook } from "@/types/library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Users, TrendingUp, LogIn, UserPlus, Library as LibraryIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Library = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Fetch library statistics
  const { data: stats } = useQuery({
    queryKey: ["library-statistics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("library_statistics")
        .select("*")
        .single();
      
      if (error) throw error;
      return data as LibraryStatistics;
    },
  });

  // Fetch popular books
  const { data: popularBooks } = useQuery({
    queryKey: ["popular-books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("popular_books")
        .select("*")
        .limit(6);
      
      if (error) throw error;
      return data as PopularBook[];
    },
  });

  // Fetch new arrivals (recently added books)
  const { data: newArrivals } = useQuery({
    queryKey: ["new-arrivals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data as Book[];
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/library/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LibraryIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Library Portal</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/auth?mode=login")}>
              <LogIn className="mr-2 h-4 w-4" />
              Member Login
            </Button>
            <Button onClick={() => navigate("/library/join")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Join the Library
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Discover Your Next Great Read
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Access thousands of books, eBooks, and audiobooks from Kampala's leading school library
          </p>
          
          {/* Search Bar */}
          <div className="flex gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                className="pl-10 h-12 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button size="lg" onClick={handleSearch} className="h-12 px-8">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-12 px-4 bg-primary/5">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Books</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <span className="text-3xl font-bold">{stats?.total_books?.toLocaleString() || "0"}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats?.total_physical_books || 0} Physical · {stats?.total_digital_books || 0} eBooks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-8 w-8 text-green-600" />
                  <span className="text-3xl font-bold">{stats?.total_active_members?.toLocaleString() || "0"}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Join our reading community</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Books Issued</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <span className="text-3xl font-bold">{stats?.books_currently_issued || "0"}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Currently in circulation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Digital Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <LibraryIcon className="h-8 w-8 text-purple-600" />
                  <span className="text-3xl font-bold">
                    {((stats?.total_digital_books || 0) + (stats?.total_audio_books || 0)).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Available 24/7 online</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trending Books */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold">Trending in Kampala</h3>
              <p className="text-muted-foreground">Most popular books this month</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/library/catalog")}>
              View All Books
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularBooks?.map((book) => (
              <Card key={book.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                    {book.cover_image_url ? (
                      <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {book.title}
                  </CardTitle>
                  <CardDescription>{book.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{book.category}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>{book.total_issues} issues</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold">New Arrivals</h3>
              <p className="text-muted-foreground">Recently added to our collection</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newArrivals?.map((book) => (
              <Card key={book.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="aspect-[3/4] bg-gradient-to-br from-green-100 to-blue-100 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                    {book.cover_image_url ? (
                      <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {book.title}
                  </CardTitle>
                  <CardDescription>{book.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{book.category}</Badge>
                    <Badge variant="outline" className="capitalize">
                      {book.book_type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-purple-600 text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="text-4xl font-bold mb-4">Ready to Start Your Reading Journey?</h3>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of students and book lovers. Get instant access to our digital library!
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate("/library/join")}>
              <UserPlus className="mr-2 h-5 w-5" />
              Become a Member
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white" onClick={() => navigate("/library/catalog")}>
              Browse Catalog
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-slate-50">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2026 Africana Muslim Secondary School Library. All rights reserved.</p>
          <p className="mt-2">Kampala, Uganda</p>
        </div>
      </footer>
    </div>
  );
};

export default Library;
