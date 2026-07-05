"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}

export function RatingStars({ rating, size = 16, className, showValue }: RatingStarsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex" aria-label={`Рейтинг ${rating} из 5`}>
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = rating >= i;
          const half = !filled && rating >= i - 0.5;
          return (
            <Star
              key={i}
              style={{ width: size, height: size }}
              className={cn(
                filled || half ? "fill-warning text-warning" : "fill-muted text-muted",
              )}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-muted-foreground tabular-nums">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
