"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product/product-card";
import type { Product } from "@/types";

const CARD_W = 220;
const GAP = 16;
const STEP = CARD_W + GAP;

export default function ProductSection({ title, products, loading, startDelay = 0 }: { title: string; products: Product[]; loading?: boolean; startDelay?: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const total = loading ? 0 : products.length;

  const updateEdges = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    updateEdges();
  }, [loading, total]);

  const scrollByStep = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * STEP, behavior: "smooth" });
  };

  // авто-прокрутка каждые 3 секунды, со своим стартовым сдвигом; зацикливается в начало у конца
  useEffect(() => {
    if (loading || total < 2) return;
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        const el = scrollRef.current;
        if (!el) return;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 4) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: STEP, behavior: "smooth" });
        }
      }, 3000);
    }, startDelay);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [loading, total, startDelay]);

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-extrabold sm:text-2xl">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollByStep(-1)}
            disabled={atStart}
            className="hidden h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-secondary disabled:opacity-30 sm:flex"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollByStep(1)}
            disabled={atEnd}
            className="hidden h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-secondary disabled:opacity-30 sm:flex"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <Link href="/catalog" className="ml-1 flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Все <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Нативный горизонтальный скролл — свайп пальцем на мобильных "из коробки" */}
      <div
        ref={scrollRef}
        onScroll={updateEdges}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-[220px] shrink-0 snap-start"><ProductCardSkeleton /></div>
            ))
          : products.map((p) => (
              <div key={p.id} className="w-[220px] shrink-0 snap-start">
                <ProductCard product={p} />
              </div>
            ))
        }
      </div>
    </section>
  );
}
