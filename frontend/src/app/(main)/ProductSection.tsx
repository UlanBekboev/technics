"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product/product-card";
import type { Product } from "@/types";

const CARD_W = 220;
const GAP = 16;

export default function ProductSection({ title, products, loading, startDelay = 0 }: { title: string; products: Product[]; loading?: boolean; startDelay?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(5);

  // считаем сколько целых карточек помещается в контейнер
  useEffect(() => {
    const update = () => {
      if (!wrapRef.current) return;
      const w = wrapRef.current.offsetWidth;
      setVisible(Math.max(1, Math.floor((w + GAP) / (CARD_W + GAP))));
    };
    update();
    const ro = new ResizeObserver(update);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const total = loading ? 0 : products.length;
  const maxIdx = Math.max(0, total - visible);

  const goTo = (i: number) => setIdx(Math.max(0, Math.min(i, maxIdx)));

  // авто-прокрутка каждые 3 секунды, со своим стартовым сдвигом
  useEffect(() => {
    if (loading || total < 2) return;
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setIdx((prev) => (prev >= maxIdx ? 0 : prev + 1));
      }, 3000);
    }, startDelay);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [loading, total, maxIdx, startDelay]);

  const offset = idx * (CARD_W + GAP);

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-extrabold sm:text-2xl">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(idx - 1)}
            disabled={idx === 0}
            className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-secondary disabled:opacity-30"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => goTo(idx + 1)}
            disabled={idx >= maxIdx}
            className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-secondary disabled:opacity-30"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <Link href="/catalog" className="ml-1 flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Все <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* overflow:hidden обрезает по границе, transform двигает точно на CARD_W+GAP */}
      <div ref={wrapRef} className="overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-500 ease-in-out pb-2"
          style={{ transform: `translateX(-${offset}px)` }}
        >
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-[220px] shrink-0"><ProductCardSkeleton /></div>
              ))
            : products.map((p) => (
                <div key={p.id} className="w-[220px] shrink-0">
                  <ProductCard product={p} />
                </div>
              ))
          }
        </div>
      </div>
    </section>
  );
}
