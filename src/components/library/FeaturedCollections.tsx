import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Book {
  id: string;
  title: string;
  author: string;
  cover_image_url: string | null;
  category: string;
  book_type: 'physical' | 'digital' | 'both';
  available_physical_copies: number;
}

interface FeaturedCollectionsProps {
  type: 'new_arrivals' | 'trending';
}

const FeaturedCollections = ({ type }: FeaturedCollectionsProps) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const title = type === 'new_arrivals' ? 'New Arrivals' : 'Trending in Kampala';
  const icon = type === 'new_arrivals' ? Clock : TrendingUp;
  const Icon = icon;

  useEffect(() => {
    fetchBooks();
  }, [type]);

  const fetchBooks = async () => {
    setIsLoading(true);
    const column = type === 'new_arrivals' ? 'is_new_arrival' : 'is_trending';

    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq(column, true)
      .limit(10)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBooks(data);
    }
    setIsLoading(false);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, books.length - 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, books.length - 3)) % Math.max(1, books.length - 3));
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Icon className="w-8 h-8 text-primary" />
            <h2 className="font-serif text-3xl font-bold">{title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (books.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Icon className="w-8 h-8 text-primary" />
            <h2 className="font-serif text-3xl font-bold">{title}</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              disabled={books.length <= 4}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              disabled={books.length <= 4}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out gap-6"
            style={{ transform: `translateX(-${currentIndex * 25}%)` }}
          >
            {books.map((book) => (
              <div key={book.id} className="min-w-[calc(25%-18px)] md:min-w-[calc(25%-18px)]">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <BookOpen className="w-16 h-16 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      {book.book_type === 'digital' && (
                        <Badge className="bg-blue-500">Digital</Badge>
                      )}
                      {book.book_type === 'physical' && book.available_physical_copies > 0 && (
                        <Badge className="bg-green-500">Available</Badge>
                      )}
                      {book.book_type === 'both' && (
                        <Badge className="bg-purple-500">Both</Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2 min-h-[3.5rem]">
                      {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                    <Badge variant="outline" className="text-xs">
                      {book.category}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
