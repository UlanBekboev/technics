"use client";

import { formatPrice, discountPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceBlockProps {
  price: number;
  oldPrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { now: "text-base", old: "text-xs" },
  md: { now: "text-xl", old: "text-sm" },
  lg: { now: "text-3xl", old: "text-base" },
};

export function PriceBlock({ price, oldPrice, size = "md", className }: PriceBlockProps) {
  const s = sizes[size];
  const percent = discountPercent(price, oldPrice);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className={cn("font-heading font-bold tabular-nums text-foreground", s.now)}>
        {formatPrice(price)}
      </span>
      {percent > 0 && (
        <>
          <span className={cn("text-muted-foreground line-through tabular-nums", s.old)}>
            {formatPrice(oldPrice!)}
          </span>
          <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-xs font-semibold text-destructive">
            −{percent}%
          </span>
        </>
      )}
    </div>
  );
}
