import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

const sizeMap = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };

export function StarRating({ rating, onRate, size = "md", readonly = false }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeMap[size],
            star <= rating ? "fill-accent text-accent" : "text-muted-foreground/30",
            !readonly && "cursor-pointer hover:text-accent transition-colors"
          )}
          onClick={() => !readonly && onRate?.(star)}
        />
      ))}
    </div>
  );
}
