import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { mockBooks } from "@/lib/mock-data";
import BookCard from "./BookCard";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const FeaturedCollections = () => {
  const newArrivalsRef = useRef<HTMLDivElement>(null);
  const trendingRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const newArrivals = [...mockBooks]
    .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
    .slice(0, 6);

  const trending = [...mockBooks]
    .sort((a, b) => b.borrowCount - a.borrowCount)
    .slice(0, 6);

  const scroll = (ref: React.RefObject<HTMLDivElement>, dir: "left" | "right") => {
    if (ref.current) {
      ref.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    }
  };

  const handleReserve = () => {
    toast({
      title: "Login Required",
      description: "Please log in or register to reserve books.",
    });
    navigate("/auth");
  };

  const handleRead = () => {
    toast({
      title: "Login Required",
      description: "Please log in or register to read digital books.",
    });
    navigate("/auth");
  };

  return (
    <section id="collections" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* New Arrivals */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                New Arrivals
              </h2>
              <p className="text-muted-foreground mt-1">
                Fresh additions to our collection
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scroll(newArrivalsRef, "left")}
                className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll(newArrivalsRef, "right")}
                className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div
            ref={newArrivalsRef}
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {newArrivals.map((book) => (
              <div key={book.id} className="min-w-[240px] max-w-[240px] snap-start">
                <BookCard book={book} onReserve={handleReserve} onRead={handleRead} />
              </div>
            ))}
          </div>
        </div>

        {/* Trending in Kampala */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                Trending in Kampala
              </h2>
              <p className="text-muted-foreground mt-1">
                Most borrowed books this month
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scroll(trendingRef, "left")}
                className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll(trendingRef, "right")}
                className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div
            ref={trendingRef}
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {trending.map((book) => (
              <div key={book.id} className="min-w-[240px] max-w-[240px] snap-start">
                <BookCard book={book} onReserve={handleReserve} onRead={handleRead} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
