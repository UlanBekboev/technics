'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Video, Camera, Zap, Settings, Shield, Phone, Lock,
  Wifi, HardDrive, Laptop, Monitor, Cpu, Mouse, Printer, ShoppingBag,
  Tv, Home, Utensils, Sparkles, Package, type LucideIcon,
} from 'lucide-react';
import { getCategories } from '@/lib/api';

interface SubCategory { id: number; name: string; slug: string; }
interface Category    { id: number; name: string; slug: string; subcategories: SubCategory[]; }

const ICONS: Record<string, LucideIcon> = {
  'videoregistratory': Video,
  'videokamery':        Camera,
  'kabel':              Zap,
  'prochee-dlya-videonab': Settings,
  'signalizatsiya-i-po':   Shield,
  'domofoniya':         Phone,
  'kontrol-dostupa':    Lock,
  'setevye-ustroystva': Wifi,
  'nositeli-informatsii': HardDrive,
  'noutbuki-monobloki': Laptop,
  'monitory':           Monitor,
  'kompyutery':         Cpu,
  'aksessuary-dlya-pk': Mouse,
  'printery-proektory': Printer,
  'torgovoe-oborudovanie': ShoppingBag,
  'televizory-i-audio': Tv,
  'tekhnika-dlya-doma': Home,
  'tekhnika-dlya-kukhni': Utensils,
  'zdorovye-i-krasota': Sparkles,
  'aksessuary':         Package,
};

const BG = '#0057B8';

export default function CatalogSidebar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeId,   setActiveId]   = useState<number | null>(null);
  const [popupTop,   setPopupTop]   = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const leaveTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

  const clearLeave    = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); };
  const scheduleClose = () => { clearLeave(); leaveTimer.current = setTimeout(() => setActiveId(null), 150); };

  const handleItemEnter = (cat: Category, el: HTMLElement) => {
    clearLeave();
    if (!cat.subcategories?.length) { setActiveId(null); return; }
    const containerTop = containerRef.current?.getBoundingClientRect().top ?? 0;
    setPopupTop(el.getBoundingClientRect().top - containerTop);
    setActiveId(cat.id);
  };

  const activeCategory = categories.find((c) => c.id === activeId);

  return (
    <div
      ref={containerRef}
      className="relative w-[240px] flex-shrink-0 flex flex-col"
      style={{ background: BG }}
      onMouseLeave={scheduleClose}
    >

      {/* Categories — scrollable, fills remaining height */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {categories.map((cat) => {
          const Icon     = ICONS[cat.slug] ?? Package;
          const isActive = activeId === cat.id;
          return (
            <div
              key={cat.id}
              onMouseEnter={(e) => handleItemEnter(cat, e.currentTarget)}
              style={{ background: isActive ? 'rgba(255,255,255,0.13)' : 'transparent' }}
              className="hover:bg-white/[0.09] transition-colors"
            >
              <Link
                href={`/catalog?category=${cat.slug}`}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm"
              >
                {/* Amber icon — like gadjet.kg */}
                <Icon size={15} className="flex-shrink-0" style={{ color: '#FCD34D' }} />
                <span className={`flex-1 leading-snug text-[13px] ${isActive ? 'text-white font-medium' : 'text-white/88'}`}>
                  {cat.name}
                </span>
                {cat.subcategories?.length > 0 && (
                  <ChevronRight size={12} className="flex-shrink-0 text-white/30" />
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Subcategory popup */}
      {activeId && activeCategory && activeCategory.subcategories.length > 0 && (
        <div
          className="absolute left-full z-50"
          style={{ top: popupTop + 44, marginLeft: '1px' }}
          onMouseEnter={clearLeave}
          onMouseLeave={scheduleClose}
        >
          <div className="bg-white border border-gray-200 shadow-2xl w-64 py-2 rounded-sm">
            <Link
              href={`/catalog?category=${activeCategory.slug}`}
              className="block px-4 py-2 mb-1 border-b border-gray-100 text-[11px] font-bold uppercase tracking-widest text-blue-800 hover:bg-blue-50 transition-colors"
            >
              {activeCategory.name}
            </Link>
            {activeCategory.subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/catalog?category=${sub.slug}`}
                className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
