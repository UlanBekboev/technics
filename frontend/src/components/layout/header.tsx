"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, User, Phone, Menu, Search, X, ChevronRight, LayoutGrid, ChevronDown, LayoutDashboard } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { useAuthStore } from "@/store/auth";
import { getCategories } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useSiteSettings } from "@/context/SiteSettingsContext";

type Category = { id: number; name: string; slug: string; parentId?: number | null; subcategories?: Category[] };

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold tabular-nums text-primary-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
}

const NAV_LINKS = [
  { label: "Главная", to: "/" },
  { label: "Каталог", to: "/catalog" },
  { label: "Акции", to: "/aktsii" },
  { label: "О компании", to: "/about" },
  { label: "Контакты", to: "/contacts" },
];


export function Header() {
  const cartCount = useCartStore((s) => s.count());
  const favCount = useFavoritesStore((s) => s.count());
  const user = useAuthStore((s) => s.user);
  const siteSettings = useSiteSettings();
  const sitePhone = siteSettings.sitePhone || "0704 44 33 33";
  const sitePhoneHref = "tel:" + sitePhone.replace(/\s/g, "").replace(/^0/, "+996");
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeParent, setActiveParent] = useState<Category | null>(null);
  const catalogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    getCategories().then((data: Category[]) => {
      // API уже возвращает вложенную структуру с subcategories
      setCategories(data.filter((c) => !c.parentId));
    }).catch(() => {});
  }, []);

  // Close catalog on route change
  useEffect(() => {
    setCatalogOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Click outside to close catalog
  useEffect(() => {
    if (!catalogOpen) return;
    const handler = (e: MouseEvent) => {
      if (catalogRef.current && !catalogRef.current.contains(e.target as Node)) {
        setCatalogOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [catalogOpen]);

  const cart = mounted ? cartCount : 0;
  const favorites = mounted ? favCount : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  const topCategories = categories.slice(0, 20);
  const displayParent = activeParent ?? topCategories[0] ?? null;

  return (
    <>
      <div className="sticky top-0 z-40">
        {/* Admin bar — visible only for ADMIN role */}
        {mounted && user?.role === "ADMIN" && (
          <div className="bg-foreground text-xs h-8">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
              <span className="text-white/50 font-medium">Режим администратора</span>
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 font-semibold text-white transition-colors hover:bg-white/20"
              >
                <LayoutDashboard className="h-3 w-3" />
                Панель управления
              </Link>
            </div>
          </div>
        )}
      <header className="border-b bg-white/95 backdrop-blur-lg" style={{ borderColor: "hsl(var(--border))" }}>
        {/* Top bar */}
        <div className="hidden border-b lg:block" style={{ borderColor: "hsl(var(--border))", opacity: 0.6 }}>
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            <nav className="flex items-center gap-5">
              {NAV_LINKS.map((l) => (
                <Link key={l.to} href={l.to} className="hover:text-foreground transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <span>Доставка по Бишкеку и регионам</span>
              <a href={sitePhoneHref} className="flex items-center gap-1.5 font-medium hover:text-primary transition-colors" style={{ color: "hsl(var(--foreground))" }}>
                <Phone className="h-3.5 w-3.5" />
                {sitePhone}
              </a>
            </div>
          </div>
        </div>

        {/* Main bar */}
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 lg:h-[60px] lg:gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-secondary lg:hidden"
            aria-label="Меню"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-black">T</div>
            <span className="hidden text-lg font-black tracking-tight text-foreground sm:block">TECHNICS</span>
          </Link>

          {/* Catalog burger button (desktop) */}
          <div ref={catalogRef} className="relative hidden lg:block">
            <button
              onClick={() => { setCatalogOpen((v) => !v); setActiveParent(null); }}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors",
                catalogOpen
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary hover:bg-primary/15"
              )}
            >
              <Menu className="h-4 w-4" />
              Каталог
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", catalogOpen && "rotate-180")} />
            </button>

            {/* Mega dropdown */}
            {catalogOpen && (
              <div className="absolute left-0 top-full mt-2 flex w-[680px] rounded-2xl border bg-white shadow-2xl overflow-hidden z-50"
                style={{ borderColor: "hsl(var(--border))" }}>
                {/* Left: parent categories */}
                <div className="w-56 shrink-0 bg-secondary/50 border-r py-2 overflow-y-auto max-h-[70vh]"
                  style={{ borderColor: "hsl(var(--border))" }}>
                  {topCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onMouseEnter={() => setActiveParent(cat)}
                      onClick={() => { router.push(`/catalog?category=${cat.slug}`); setCatalogOpen(false); }}
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-2.5 text-sm text-left transition-colors",
                        displayParent?.id === cat.id
                          ? "bg-white font-semibold text-primary"
                          : "hover:bg-white/70 text-foreground"
                      )}
                    >
                      <span className="truncate">{cat.name}</span>
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  ))}
                  <div className="border-t mt-1 pt-1" style={{ borderColor: "hsl(var(--border))" }}>
                    <Link href="/catalog" onClick={() => setCatalogOpen(false)}
                      className="flex w-full items-center px-4 py-2.5 text-sm text-primary font-medium hover:bg-white/70">
                      Все категории →
                    </Link>
                  </div>
                </div>

                {/* Right: children or brand list */}
                <div className="flex-1 p-4 overflow-y-auto max-h-[70vh]">
                  {displayParent ? (
                    <>
                      <Link href={`/catalog?category=${displayParent.slug}`} onClick={() => setCatalogOpen(false)}
                        className="mb-3 flex items-center gap-2 text-base font-bold text-primary hover:underline">
                        <LayoutGrid className="h-4 w-4" />
                        {displayParent.name}
                      </Link>
                      {displayParent.subcategories && displayParent.subcategories.length > 0 ? (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {displayParent.subcategories.map((child) => (
                            <Link
                              key={child.id}
                              href={`/catalog?category=${child.slug}`}
                              onClick={() => setCatalogOpen(false)}
                              className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-foreground/80 hover:bg-secondary hover:text-primary transition-colors"
                            >
                              <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Нет подкатегорий</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Выберите категорию</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden flex-1 md:flex">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск товаров..."
                className="h-10 w-full rounded-lg border bg-secondary pl-10 pr-4 text-sm outline-none ring-0 transition focus:border-primary focus:ring-1 focus:ring-primary/30"
                style={{ borderColor: "hsl(var(--border))" }}
              />
            </div>
          </form>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-0.5 lg:gap-1">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-secondary md:hidden"
              aria-label="Поиск"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link href="/favorites" aria-label="Избранное"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-secondary">
              <Heart className="h-5 w-5" />
              <CountBadge count={favorites} />
            </Link>

            <Link href="/cart" aria-label="Корзина"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-secondary">
              <ShoppingCart className="h-5 w-5" />
              <CountBadge count={cart} />
            </Link>

            <Link href={user ? "/profile" : "/login"}
              className="flex h-10 items-center gap-2 rounded-lg px-2.5 text-sm font-medium transition-colors hover:bg-secondary">
              <User className="h-5 w-5" />
              <span className="hidden xl:inline">{user ? user.name.split(" ")[0] : "Войти"}</span>
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="border-t px-4 pb-3 md:hidden" style={{ borderColor: "hsl(var(--border))" }}>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск..."
                className="h-10 flex-1 rounded-lg border bg-secondary px-3 text-sm outline-none focus:border-primary"
                style={{ borderColor: "hsl(var(--border))" }}
              />
              <button type="submit" className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </header>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-white shadow-xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 shrink-0" style={{ borderColor: "hsl(var(--border))" }}>
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-black">T</div>
                <span className="text-lg font-black">TECHNICS</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Nav links */}
              <nav className="flex flex-col px-3 py-3 gap-0.5">
                {NAV_LINKS.map((l) => (
                  <Link key={l.to} href={l.to} onClick={() => setMobileOpen(false)}
                    className="flex h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors hover:bg-secondary">
                    {l.label}
                  </Link>
                ))}
              </nav>

              {/* Categories section */}
              {topCategories.length > 0 && (
                <div className="border-t mt-1" style={{ borderColor: "hsl(var(--border))" }}>
                  <div className="flex items-center gap-2 px-4 py-2.5">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Категории</span>
                  </div>
                  <div className="px-3 pb-3 space-y-0.5">
                    {topCategories.map((cat) => (
                      <div key={cat.id}>
                        <Link
                          href={`/catalog?category=${cat.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex h-10 items-center justify-between rounded-lg px-3 text-sm font-medium hover:bg-secondary hover:text-primary transition-colors"
                        >
                          <span className="truncate">{cat.name}</span>
                          {cat.subcategories && cat.subcategories.length > 0 && (
                            <span className="text-xs text-muted-foreground shrink-0 ml-2">
                              {cat.subcategories.length}
                            </span>
                          )}
                        </Link>
                        {/* Sub-categories */}
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <div className="ml-3 pl-3 border-l space-y-0.5 mb-1"
                            style={{ borderColor: "hsl(var(--border))" }}>
                            {cat.subcategories.slice(0, 5).map((child) => (
                              <Link
                                key={child.id}
                                href={`/catalog?category=${child.slug}`}
                                onClick={() => setMobileOpen(false)}
                                className="flex h-9 items-center rounded-lg px-2 text-xs text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                              >
                                {child.name}
                              </Link>
                            ))}
                            {cat.subcategories.length > 5 && (
                              <Link href={`/catalog?category=${cat.slug}`} onClick={() => setMobileOpen(false)}
                                className="flex h-9 items-center rounded-lg px-2 text-xs font-medium text-primary">
                                Ещё {cat.subcategories.length - 5}...
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-4 shrink-0" style={{ borderColor: "hsl(var(--border))" }}>
              <a href={sitePhoneHref} className="flex items-center gap-2 text-sm font-bold text-primary">
                <Phone className="h-4 w-4" />
                {sitePhone}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
