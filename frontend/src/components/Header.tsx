'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, User, Phone, MapPin, Menu, X, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useFavoritesStore } from '@/store/favorites';
import { getProducts, getMe, getFavoriteIds } from '@/lib/api';
import Logo from './Logo';

const NAV_LINKS = [
  { label: 'Главная',  href: '/' },
  { label: 'Каталог',  href: '/catalog' },
  { label: 'Доставка', href: '#' },
  { label: 'Контакты', href: '#' },
];

const QUICK_CATS = [
  { label: 'Видеокамеры',        href: '/catalog?category=videokamery' },
  { label: 'Видеорегистраторы',  href: '/catalog?category=videoregistratory' },
  { label: 'Ноутбуки',           href: '/catalog?category=noutbuki-monobloki' },
  { label: 'Мониторы',           href: '/catalog?category=monitory' },
  { label: 'Компьютеры',         href: '/catalog?category=kompyutery' },
  { label: 'Аксессуары для ПК',  href: '/catalog?category=aksessuary-dlya-pk' },
  { label: 'Сигнализация',       href: '/catalog?category=signalizatsiya-i-po' },
  { label: 'Домофония',          href: '/catalog?category=domofoniya' },
];

const TOPBAR_BG = '#051832';

export default function Header() {
  const [search, setSearch]       = useState('');
  const [results, setResults]     = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen]           = useState(false);
  const [mounted, setMounted]     = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const wrapRef                   = useRef<HTMLFormElement>(null);
  const { count } = useCartStore();
  const { user, logout, setAuth, token } = useAuthStore();
  const { count: favCount, setIds: setFavIds } = useFavoritesStore();

  useEffect(() => {
    setMounted(true);
    if (token) {
      getMe().then(fresh => setAuth(fresh, token)).catch(() => {});
      getFavoriteIds().then(setFavIds).catch(() => {});
    }
  }, []);

  // Debounced live search
  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await getProducts({ search: q, limit: 6 });
        setResults(data.items ?? []);
        setOpen(true);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setOpen(false);
    if (search.trim()) window.location.href = `/catalog?search=${encodeURIComponent(search)}`;
  };

  const handleSelect = (slug: string) => {
    setOpen(false);
    setSearch('');
    window.location.href = `/product/${slug}`;
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-md">

      {/* ── Top navigation bar ── */}
      <div className="hidden md:block text-white text-xs" style={{ background: TOPBAR_BG }}>
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between gap-4">

          {/* Nav links */}
          <nav className="flex items-center gap-0">
            {NAV_LINKS.map((item, i) => (
              <span key={item.label} className="flex items-center">
                <Link
                  href={item.href}
                  className="px-3 py-1 hover:text-amber-300 transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
                {i < NAV_LINKS.length - 1 && <span className="text-white/20">|</span>}
              </span>
            ))}
          </nav>

          {/* Phones */}
          <div className="hidden md:flex items-center gap-4">
            <a href="tel:+996700916121" className="flex items-center gap-1.5 hover:text-amber-300 transition-colors">
              <Phone size={11} /> +996 700 916 121
            </a>
            <span className="text-white/20">|</span>
            <a href="tel:+996551916122" className="flex items-center gap-1.5 hover:text-amber-300 transition-colors">
              <Phone size={11} /> +996 551 916 122
            </a>
          </div>

          {/* Address + auth */}
          <div className="flex items-center gap-4">
            <span className="hidden lg:flex items-center gap-1 text-white/70">
              <MapPin size={11} /> г. Бишкек
            </span>
            {user ? (
              <>
                <Link href="/orders" className="hover:text-amber-300 transition-colors">{user.name}</Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin/orders" className="hover:text-amber-300 transition-colors">Админ</Link>
                )}
                <button onClick={logout} className="hover:text-red-300 transition-colors">Выйти</button>
              </>
            ) : (
              <>
                <Link href="/login"    className="hover:text-amber-300 transition-colors">Войти</Link>
                <Link href="/register" className="hover:text-amber-300 transition-colors hidden sm:block">Регистрация</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Main row: logo · search · user · cart ── */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-2.5">
          <Logo size={44} />
          <div className="leading-tight hidden sm:block">
            <div className="text-[15px] font-black tracking-widest uppercase" style={{ color: '#0057B8' }}>
              TECHNICS
            </div>
            <div className="text-[9px] text-gray-400 tracking-[0.18em] uppercase">
              Интернет-магазин
            </div>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl" ref={wrapRef}>
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder="Живой поиск..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-12 text-sm focus:outline-none bg-gray-50 focus:bg-white focus:border-blue-400 transition-all"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full px-4 rounded-r-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity"
              style={{ background: TOPBAR_BG }}
            >
              {searching
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Search size={16} />}
            </button>

            {/* Dropdown */}
            {open && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                {results.map((p) => {
                  const img = p.images?.find((i: any) => i.isMain) || p.images?.[0];
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelect(p.slug)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 flex-shrink-0 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                        {img
                          ? <img src={img.url} alt="" className="w-full h-full object-contain p-0.5" />
                          : <Search size={14} className="text-gray-300" />}
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
                <button
                  type="submit"
                  className="w-full text-center text-xs font-medium py-2.5 border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  style={{ color: TOPBAR_BG }}
                >
                  Смотреть все результаты по «{search}»
                </button>
              </div>
            )}
          </div>
        </form>

        {/* User & Favorites & Cart */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
          <Link href={user ? '/profile' : '/login'} className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <User size={20} className="text-gray-500" />
            <span className="text-[10px] text-gray-400 mt-0.5">{user ? user.name.split(' ')[0] : 'Войти'}</span>
          </Link>

          <Link href="/favorites" className="relative flex flex-col items-center p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Heart size={20} className="text-gray-500" />
            <span className="text-[10px] text-gray-400 mt-0.5">Избранное</span>
            {mounted && favCount() > 0 && (
              <span className="absolute top-1 right-1 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold" style={{ background: '#E53E3E' }}>
                {favCount()}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className="relative flex flex-col items-center p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ShoppingCart size={20} className="text-gray-500" />
            <span className="text-[10px] text-gray-400 mt-0.5">Корзина</span>
            {mounted && count() > 0 && (
              <span className="absolute top-1 right-1 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold" style={{ background: '#E53E3E' }}>
                {count()}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ── Category pills ── */}
      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-2" style={{ scrollbarWidth: 'none' }}>
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600"
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            {QUICK_CATS.map((cat) => (
              <a
                key={cat.href}
                href={cat.href}
                className="flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-all whitespace-nowrap"
              >
                {cat.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-1 flex flex-col gap-1">
            <a href="tel:+996700916121" className="py-2.5 px-3 flex items-center gap-2 text-sm text-gray-600">
              <Phone size={14} /> +996 700 916 121
            </a>
            <a href="tel:+996551916122" className="py-2.5 px-3 flex items-center gap-2 text-sm text-gray-600">
              <Phone size={14} /> +996 551 916 122
            </a>
            <span className="py-2.5 px-3 flex items-center gap-2 text-sm text-gray-400">
              <MapPin size={14} /> г. Бишкек
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
