import type { Book } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BookCardProps {
  book: Book;
  onReserve?: (book: Book) => void;
  onRead?: (book: Book) => void;
  compact?: boolean;
}

const BookCard = ({ book, onReserve, onRead, compact }: BookCardProps) => {
  const statusColors: Record<string, string> = {
    available: "bg-emerald-100 text-emerald-800",
    borrowed: "bg-amber-100 text-amber-800",
    reserved: "bg-blue-100 text-blue-800",
    maintenance: "bg-gray-100 text-gray-800",
  };

  if (compact) {
    return (
      <div className="group flex gap-3 p-3 rounded-lg bg-card border border-border hover:shadow-md transition-all">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-14 h-20 object-cover rounded-md flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground truncate">{book.title}</h4>
          <p className="text-xs text-muted-foreground truncate">{book.author}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {book.format === "digital" ? "eBook" : "Physical"}
            </Badge>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusColors[book.status]}`}>
              {book.status}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge
            className={
              book.format === "digital"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }
          >
            {book.format === "digital" ? "eBook" : "Physical"}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[book.status]}`}>
            {book.status}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-serif font-semibold text-foreground line-clamp-2 mb-1">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">{book.author}</p>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-xs ${i < Math.floor(book.rating) ? "text-amber-500" : "text-gray-300"}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({book.rating})</span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>{book.category}</span>
          <span>{book.publishedYear}</span>
        </div>

        {book.format === "physical" && (
          <p className="text-xs text-muted-foreground mb-3">
            {book.availableCopies} of {book.totalCopies} copies available
          </p>
        )}

        <div className="mt-auto flex gap-2">
          {book.status === "available" && book.format === "physical" && onReserve && (
            <Button size="sm" className="flex-1" onClick={() => onReserve(book)}>
              Reserve
            </Button>
          )}
          {book.format === "digital" && onRead && (
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onRead(book)}>
              Read Now
            </Button>
          )}
          {book.status !== "available" && book.format === "physical" && (
            <Button size="sm" variant="outline" className="flex-1" disabled>
              {book.status === "borrowed" ? "Unavailable" : "Reserved"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
