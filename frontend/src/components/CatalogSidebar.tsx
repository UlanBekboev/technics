'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Menu, ChevronRight, Video, Camera, Zap, Settings, Shield, Phone, Lock,
  Wifi, HardDrive, Laptop, Monitor, Cpu, Mouse, Printer, ShoppingBag,
  Tv, Home, Utensils, Sparkles, Package, X, type LucideIcon,
} from 'lucide-react';
import { getCategories } from '@/lib/api';

interface SubCategory { id: number; name: string; slug: string; }
interface Category    { id: number; name: string; slug: string; subcategories: SubCategory[]; }

const ICONS: Record<string, LucideIcon> = {
  'videoregistratory':      Video,
  'videokamery':            Camera,
  'kabel':                  Zap,
  'prochee-dlya-videonab':  Settings,
  'signalizatsiya-i-po':    Shield,
  'domofoniya':             Phone,
  'kontrol-dostupa':        Lock,
  'setevye-ustroystva':     Wifi,
  'nositeli-informatsii':   HardDrive,
  'noutbuki-monobloki':     Laptop,
  'monitory':               Monitor,
  'kompyutery':             Cpu,
  'aksessuary-dlya-pk':     Mouse,
  'printery-proektory':     Printer,
  'torgovoe-oborudovanie':  ShoppingBag,
  'televizory-i-audio':     Tv,
  'tekhnika-dlya-doma':     Home,
  'tekhnika-dlya-kukhni':   Utensils,
  'zdorovye-i-krasota':     Sparkles,
  'aksessuary':             Package,
};

const BG      = '#0057B8';
const BG_HEAD = '#003d8f';

export default function CatalogSidebar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open,       setOpen]       = useState(false);
  const [activeId,   setActiveId]   = useState<number | null>(null);
  // Координаты flyout в viewport (position: fixed)
  const [flyoutPos,  setFlyoutPos]  = useState({ top: 0, left: 0 });
  const panelRef   = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

  const clearLeave    = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); };
  const scheduleClose = () => { clearLeave(); leaveTimer.current = setTimeout(() => setActiveId(null), 200); };

  const handleItemEnter = (cat: Category, el: HTMLElement) => {
    clearLeave();
    if (!cat.subcategories?.length) { setActiveId(null); return; }
    // Берём viewport-координаты элемента
    const rect = el.getBoundingClientRect();
    setFlyoutPos({ top: rect.top, left: rect.right });
    setActiveId(cat.id);
  };

  const activeCategory = categories.find((c) => c.id === activeId);

  return (
    <div className="flex h-full flex-shrink-0">

      {/* ── Кнопка-триггер: только когда панель закрыта ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-11 h-full flex flex-col items-center justify-start pt-3 gap-2 flex-shrink-0 transition-all hover:brightness-110 select-none"
          style={{ background: BG_HEAD }}
          title="Каталог товаров"
          aria-label="Открыть каталог"
        >
          <Menu size={18} className="text-white flex-shrink-0" />
          <span
            className="text-white/80 text-[9px] font-bold uppercase flex-shrink-0"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.18em' }}
          >
            Каталог
          </span>
        </button>
      )}

      {/* ── Панель категорий ── */}
      {open && (
        <div
          ref={panelRef}
          className="flex flex-col catalog-open flex-shrink-0"
          style={{ width: 240, background: BG }}
          onMouseLeave={scheduleClose}
          onMouseEnter={clearLeave}
        >
          {/* Шапка */}
          <div
            className="flex items-center justify-between px-4 py-3.5 select-none flex-shrink-0"
            style={{ background: BG_HEAD }}
          >
            <span className="font-semibold text-white text-sm tracking-wide whitespace-nowrap">
              Каталог товаров
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white transition-colors ml-2"
            >
              <X size={15} />
            </button>
          </div>

          {/* Список категорий */}
          <div>
            {categories.map((cat) => {
              const Icon     = ICONS[cat.slug] ?? Package;
              const isActive = activeId === cat.id;
              return (
                <div
                  key={cat.id}
                  onMouseEnter={(e) => handleItemEnter(cat, e.currentTarget)}
                  style={{ background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                  className="hover:bg-white/10 transition-colors"
                >
                  <Link
                    href={`/catalog?category=${cat.slug}`}
                    className="flex items-center gap-2.5 px-4 py-2.5"
                    onClick={() => setOpen(false)}
                  >
                    <Icon size={15} className="flex-shrink-0" style={{ color: '#FCD34D' }} />
                    <span className={`flex-1 text-[13px] whitespace-nowrap leading-snug ${isActive ? 'text-white font-medium' : 'text-white/90'}`}>
                      {cat.name}
                    </span>
                    {cat.subcategories?.length > 0 && (
                      <ChevronRight size={12} className="flex-shrink-0 text-white/40" />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Flyout подкатегорий — position: fixed, вне любого overflow ── */}
      {open && activeId && activeCategory && activeCategory.subcategories.length > 0 && (
        <div
          className="fixed z-[200] shadow-2xl"
          style={{ top: flyoutPos.top, left: flyoutPos.left }}
          onMouseEnter={clearLeave}
          onMouseLeave={scheduleClose}
        >
          <div className="bg-white border border-gray-200 w-60 py-1.5 rounded-sm">
            <Link
              href={`/catalog?category=${activeCategory.slug}`}
              className="block px-4 py-2 mb-1 border-b border-gray-100 text-[11px] font-bold uppercase tracking-widest text-blue-800 hover:bg-blue-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              {activeCategory.name}
            </Link>
            {activeCategory.subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/catalog?category=${sub.slug}`}
                className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                onClick={() => setOpen(false)}
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
