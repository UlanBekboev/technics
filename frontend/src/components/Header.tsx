'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Search, ShoppingCart, User, Phone, Menu, X,
  ChevronRight, ChevronDown, Heart,
  Video, Camera, Zap, Settings, Shield, Lock, Wifi, HardDrive,
  Laptop, Monitor, Cpu, Mouse, Printer, ShoppingBag, Tv, Home,
  Utensils, Sparkles, Package, type LucideIcon,
} from 'lucide-react';

import { useCartStore }      from '@/store/cart';
import { useAuthStore }      from '@/store/auth';
import { useFavoritesStore } from '@/store/favorites';
import { getProducts, getMe, getCategories, getFavoriteIds } from '@/lib/api';
import Logo from './Logo';

interface SubCategory { id: number; name: string; slug: string; }
interface Category    { id: number; name: string; slug: string; subcategories: SubCategory[]; }

const CAT_ICONS: Record<string, LucideIcon> = {
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

const CAT_COLORS: Record<string, string> = {
  'videoregistratory':      '#0057B8',
  'videokamery':            '#0891B2',
  'kabel':                  '#7C3AED',
  'prochee-dlya-videonab':  '#6B7280',
  'signalizatsiya-i-po':    '#0D9488',
  'domofoniya':             '#0891B2',
  'kontrol-dostupa':        '#DC2626',
  'setevye-ustroystva':     '#2563EB',
  'nositeli-informatsii':   '#7C3AED',
  'noutbuki-monobloki':     '#7C3AED',
  'monitory':               '#0D9488',
  'kompyutery':             '#DC2626',
  'aksessuary-dlya-pk':     '#D97706',
  'printery-proektory':     '#059669',
  'torgovoe-oborudovanie':  '#D97706',
  'televizory-i-audio':     '#059669',
  'tekhnika-dlya-doma':     '#0057B8',
  'tekhnika-dlya-kukhni':   '#DC2626',
  'zdorovye-i-krasota':     '#DB2777',
  'aksessuary':             '#6B7280',
};

const NAV_LINKS = [
  { label: 'Главная',      href: '/' },
  { label: 'Весь каталог', href: '/catalog' },
  { label: 'О компании',   href: '/#about' },
  { label: 'Контакты',     href: '/#contacts' },
];

const TOPBAR_BG = '#051832';

export default function Header() {
  const [search, setSearch]         = useState('');
  const [results, setResults]       = useState<any[]>([]);
  const [searching, setSearching]   = useState(false);
  const [dropOpen, setDropOpen]     = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [winW, setWinW]             = useState(9999);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const wrapRef = useRef<HTMLFormElement>(null);

  const { count }                            = useCartStore();
  const { user, logout, setAuth, token }     = useAuthStore();
  const { count: favCount, setIds: setFavIds } = useFavoritesStore();

  useEffect(() => {
    setMounted(true);
    setWinW(window.innerWidth);
    const onResize = () => setWinW(window.innerWidth);
    window.addEventListener('resize', onResize);
    if (token) {
      getMe().then(fresh => setAuth(fresh, token)).catch(() => {});
      getFavoriteIds().then(setFavIds).catch(() => {});
    }
    getCategories().then(setCategories).catch(() => {});
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Блокировка прокрутки при открытом drawer
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Живой поиск
  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) { setResults([]); setDropOpen(false); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await getProducts({ search: q, limit: 6 });
        setResults(data.items ?? []);
        setDropOpen(true);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setDropOpen(false);
    if (search.trim()) window.location.href = `/catalog?search=${encodeURIComponent(search)}`;
  };

  const handleSelect = (slug: string) => {
    setDropOpen(false);
    setSearch('');
    window.location.href = `/product/${slug}`;
  };

  const closeDrawer = () => { setDrawerOpen(false); setExpandedCat(null); };

  return (
    <>
      <header className="bg-white sticky top-0 z-50 shadow-md">


        {/* ── Главная строка ── */}
        <div className="max-w-7xl mx-auto px-3 phone:px-4 py-2 phone:py-3 flex items-center gap-2 phone:gap-3">

          {/* Бургер (все экраны) */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-blue-300 transition-colors"
            aria-label="Меню"
          >
            <Menu size={20} />
          </button>

          {/* Лого */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <Logo size={36} />
            <div className="leading-tight hidden sm:block">
              <div className="text-[15px] font-black tracking-widest uppercase" style={{ color: '#0057B8' }}>TECHNICS</div>
              <div className="text-[9px] text-gray-400 tracking-[0.18em] uppercase">Интернет-магазин</div>
            </div>
          </Link>

          {/* Поиск */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl" ref={wrapRef}>
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => results.length > 0 && setDropOpen(true)}
                placeholder={winW < 460 ? 'Поиск...' : 'Поиск товаров: ноутбуки, камеры, роутеры...'}
                className="w-full border border-gray-200 rounded-xl px-3 phone:px-4 py-2 phone:py-2.5 pr-10 phone:pr-12 text-sm focus:outline-none bg-gray-50 focus:bg-white focus:border-blue-400 transition-all"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-3 phone:px-5 rounded-r-xl flex items-center justify-center text-white font-semibold text-sm hover:opacity-90 transition-opacity gap-1.5"
                style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}
              >
                {searching
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <><Search size={15} /><span className="hidden sm:inline">Найти</span></>
                }
              </button>

              {/* Дропдаун результатов */}
              {dropOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                  {results.map((p) => {
                    const img = p.images?.find((i: any) => i.isMain) || p.images?.[0];
                    return (
                      <button key={p.id} type="button" onClick={() => handleSelect(p.slug)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left">
                        <div className="w-10 h-10 flex-shrink-0 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                          {img ? <img src={img.url} alt="" className="w-full h-full object-contain p-0.5" /> : <Search size={14} className="text-gray-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                          {p.brand && <p className="text-[10px] text-gray-400">{p.brand.name}</p>}
                        </div>
                        <span className="text-sm font-bold flex-shrink-0" style={{ color: '#E53E3E' }}>
                          {Number(p.price).toLocaleString()} сом
                        </span>
                      </button>
                    );
                  })}
                  <button type="submit"
                    className="w-full text-center text-xs font-medium py-2.5 border-t border-gray-100 hover:bg-gray-50 transition-colors"
                    style={{ color: TOPBAR_BG }}>
                    Смотреть все результаты по «{search}»
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Иконки справа */}
          <div className="hidden phone:flex items-center gap-0.5 flex-shrink-0">
            <Link href="/favorites"
              className="relative flex flex-col items-center p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Heart size={20} className="text-gray-500" />
              <span className="text-[10px] text-gray-400 mt-0.5">Избранное</span>
              {mounted && favCount() > 0 && (
                <span className="absolute top-1 right-1 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold" style={{ background: '#E53E3E' }}>
                  {favCount()}
                </span>
              )}
            </Link>

            <Link href="/cart"
              className="relative flex flex-col items-center p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ShoppingCart size={20} className="text-gray-500" />
              <span className="text-[10px] text-gray-400 mt-0.5">Корзина</span>
              {mounted && count() > 0 && (
                <span className="absolute top-1 right-1 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold" style={{ background: '#E53E3E' }}>
                  {count()}
                </span>
              )}
            </Link>

            <Link href={user ? '/profile' : '/login'}
              className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <User size={20} className="text-gray-500" />
              <span className="text-[10px] text-gray-400 mt-0.5">{user ? user.name.split(' ')[0] : 'Войти'}</span>
            </Link>
          </div>

          {/* Мобильные корзина/избранное (маленький экран) */}
          <div className="phone:hidden flex items-center gap-1 flex-shrink-0 ml-auto">
            <Link href="/cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              <ShoppingCart size={18} />
              {mounted && count() > 0 && (
                <span className="absolute -top-1 -right-1 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold" style={{ background: '#E53E3E' }}>
                  {count()}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          Бургер-drawer — выезжает слева
      ═══════════════════════════════════════════════ */}

      {/* Оверлей */}
      <div
        className={`fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeDrawer}
      />

      {/* Панель */}
      <div
        className={`fixed top-0 left-0 z-[210] h-full w-[340px] max-w-[90vw] bg-white flex flex-col shadow-2xl transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Шапка drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100" style={{ background: TOPBAR_BG }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-sm"
              style={{ background: 'linear-gradient(135deg,#0057B8,#0077e6)' }}>T</div>
            <span className="text-white font-bold tracking-wider text-sm">TECHNICS</span>
          </div>
          <button onClick={closeDrawer} className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Содержимое с прокруткой */}
        <div className="flex-1 overflow-y-auto">

          {/* Навигация */}
          <div className="py-2 border-b border-gray-100">
            {NAV_LINKS.map(item => {
              const isAnchor = item.href.startsWith('/#');
              const handleClick = () => {
                closeDrawer();
                if (isAnchor) {
                  const id = item.href.slice(2);
                  setTimeout(() => {
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                  }, 320);
                }
              };
              return isAnchor ? (
                <button key={item.label} onClick={handleClick}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <ChevronRight size={14} className="text-gray-300" />
                  {item.label}
                </button>
              ) : (
                <Link key={item.label} href={item.href} onClick={handleClick}
                  className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <ChevronRight size={14} className="text-gray-300" />
                  {item.label}
                </Link>
              );
            })}
            <Link href="/favorites" onClick={closeDrawer}
              className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
              <Heart size={14} className="text-gray-300" />
              Избранное
            </Link>
            <Link href={user ? '/profile' : '/login'} onClick={closeDrawer}
              className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
              <User size={14} className="text-gray-300" />
              {user ? 'Личный кабинет' : 'Войти / Регистрация'}
            </Link>
          </div>

          {/* Категории */}
          <div className="py-2">
            <p className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Категории</p>
            {categories.map(cat => {
              const Icon  = CAT_ICONS[cat.slug]  ?? Package;
              const color = CAT_COLORS[cat.slug] ?? '#6B7280';
              const isExp = expandedCat === cat.id;
              return (
                <div key={cat.id}>
                  <button
                    onClick={() => {
                      if (cat.subcategories?.length) {
                        setExpandedCat(isExp ? null : cat.id);
                      } else {
                        closeDrawer();
                        window.location.href = `/catalog?category=${cat.slug}`;
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${isExp ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-700'}`}
                  >
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: color + '18' }}>
                      <Icon size={15} style={{ color }} />
                    </span>
                    <span className="flex-1 text-left">{cat.name}</span>
                    {cat.subcategories?.length > 0 && (
                      isExp
                        ? <ChevronDown size={14} className="text-blue-400" />
                        : <ChevronRight size={14} className="text-gray-300" />
                    )}
                  </button>

                  {/* Подкатегории */}
                  {isExp && cat.subcategories?.length > 0 && (
                    <div className="bg-gray-50 border-t border-b border-gray-100">
                      <Link href={`/catalog?category=${cat.slug}`} onClick={closeDrawer}
                        className="flex items-center px-8 py-2.5 text-[13px] font-semibold text-blue-700 hover:bg-blue-50 transition-colors">
                        Все в «{cat.name}»
                      </Link>
                      {cat.subcategories.map(sub => (
                        <Link key={sub.id} href={`/catalog?category=${sub.slug}`} onClick={closeDrawer}
                          className="flex items-center px-8 py-2.5 text-[13px] text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors border-t border-gray-100">
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Для администратора */}
          {user?.role === 'ADMIN' && (
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Управление</p>
              <div className="flex flex-col gap-2">
                {[
                  { href: '/admin/orders',     label: 'Заказы' },
                  { href: '/admin/products',   label: 'Товары' },
                  { href: '/admin/categories', label: 'Категории' },
                ].map(item => (
                  <Link key={item.href} href={item.href} onClick={closeDrawer}
                    className="py-2.5 text-center text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Телефон + выход — прибит к низу */}
        <div className="border-t border-gray-100 px-5 py-4 flex flex-col gap-3 bg-white">
          <a href="tel:+996704443333"
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: '#E53E3E' }}>
            <Phone size={15} />
            +996 704 44 33 33
          </a>
          {user && (
            <button
              onClick={() => { logout(); closeDrawer(); }}
              className="py-2.5 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors">
              Выйти из аккаунта
            </button>
          )}
        </div>
      </div>
    </>
  );
}
