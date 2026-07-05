'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function RecentlyViewed() {
  const [items, setItems] = useState<any[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  const scroll = (dir: 'prev' | 'next') => {
    const el = ref.current;
    if (!el) return;
    const amount = el.clientWidth < 480 ? el.clientWidth : 260;
    el.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 pb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
          <span
            className="w-1 h-5 rounded-full inline-block"
            style={{ background: 'linear-gradient(to bottom, #003d8f, #0077e6)' }}
          />
          Вы недавно смотрели
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('prev')}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all text-white shadow hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #003d8f, #0077e6)' }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('next')}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all text-white shadow hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #003d8f, #0077e6)' }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((p) => (
          <div key={p.id} className="w-full xs:w-[200px] flex-shrink-0 snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
