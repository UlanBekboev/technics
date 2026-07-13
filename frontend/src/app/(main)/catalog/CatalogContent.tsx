"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  SlidersHorizontal, X, ChevronDown, ChevronRight,
  LayoutGrid, List, Home, Search, ShoppingCart,
} from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Pagination } from "@/components/common/pagination";
import { getProducts, getCategories, getBrands, addToCart } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import type { Product, Category, Brand } from "@/types";

const SORT_OPTIONS = [
  { value: "",           label: "По умолчанию" },
  { value: "price-asc",  label: "Сначала дешевле" },
  { value: "price-desc", label: "Сначала дороже" },
  { value: "popular",    label: "По популярности" },
];

/* ─── Breadcrumb ─── */
function Breadcrumb({ category, parentCategory }: { category?: Category; parentCategory?: Category }) {
  return (
    <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
      <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
        <Home className="h-3 w-3" /> Главная
      </Link>
      <ChevronRight className="h-3 w-3 opacity-40" />
      <Link href="/catalog" className="hover:text-primary transition-colors">Каталог</Link>
      {parentCategory && category && parentCategory.id !== category.id && (
        <>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <Link href={`/catalog?category=${parentCategory.slug}`} className="hover:text-primary transition-colors">
            {parentCategory.name}
          </Link>
        </>
      )}
      {category && (
        <>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <span className="font-medium text-foreground">{category.name}</span>
        </>
      )}
    </nav>
  );
}

/* ─── Sidebar ─── */
function Sidebar({
  categories, brands, activeCategory, activeBrand,
  minPrice, maxPrice,
  onCategory, onBrand, onPrice, onReset,
}: {
  categories: Category[]; brands: Brand[];
  activeCategory: string; activeBrand: string;
  minPrice: string; maxPrice: string;
  onCategory: (slug: string) => void;
  onBrand: (id: string) => void;
  onPrice: (min: string, max: string) => void;
  onReset: () => void;
}) {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);
  const [showAllCats, setShowAllCats] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  useEffect(() => { setMin(minPrice); setMax(maxPrice); }, [minPrice, maxPrice]);

  const topCats = categories.filter((c) => !c.parentId);
  const foundCat = categories.find((c) => c.slug === activeCategory);
  // Find parent of active (if subcategory selected)
  const parentOfActive = foundCat?.parentId
    ? categories.find((c) => c.id === foundCat.parentId)
    : null;
  // Show the active parent's subcategories, or all top-level
  const sidebarParent = parentOfActive ?? foundCat;
  const subcats = sidebarParent?.subcategories ?? [];

  const visibleCats = showAllCats ? topCats : topCats.slice(0, 14);
  const visibleBrands = showAllBrands ? brands : brands.slice(0, 8);

  const handlePriceSubmit = (e: React.FormEvent) => { e.preventDefault(); onPrice(min, max); };

  const SectionHeader = ({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between py-2 text-left"
    >
      <span className="text-sm font-bold text-foreground">{label}</span>
      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
    </button>
  );

  return (
    <aside className="space-y-0 divide-y divide-border">
      {/* Reset */}
      {(activeCategory || activeBrand || minPrice || maxPrice) && (
        <div className="pb-3">
          <button
            onClick={onReset}
            className="flex w-full items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Сбросить все фильтры
          </button>
        </div>
      )}

      {/* Categories */}
      <div className="py-3">
        <p className="mb-2 text-sm font-bold text-foreground">Категории</p>
        <ul className="space-y-0">
          {/* If a category with subcats is active — show subcats */}
          {subcats.length > 0 ? (
            <>
              <li>
                <button
                  onClick={() => onCategory(sidebarParent!.slug)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                    activeCategory === sidebarParent!.slug
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  Все в категории
                </button>
              </li>
              {subcats.map((sub) => (
                <li key={sub.id}>
                  <button
                    onClick={() => onCategory(sub.slug)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                      activeCategory === sub.slug
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <span>{sub.name}</span>
                    {activeCategory === sub.slug && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
                  </button>
                </li>
              ))}
              <li className="pt-1">
                <button
                  onClick={() => onCategory("")}
                  className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-primary hover:underline"
                >
                  ← Все категории
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button
                  onClick={() => onCategory("")}
                  className={cn(
                    "flex w-full items-center rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                    !activeCategory ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  Все категории
                </button>
              </li>
              {visibleCats.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onCategory(cat.slug)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                      activeCategory === cat.slug
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <span>{cat.name}</span>
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </button>
                </li>
              ))}
              {topCats.length > 14 && (
                <li>
                  <button
                    onClick={() => setShowAllCats((v) => !v)}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs text-primary hover:underline"
                  >
                    {showAllCats ? "Скрыть" : `Ещё ${topCats.length - 14}`}
                    <ChevronDown className={cn("h-3 w-3 transition-transform", showAllCats && "rotate-180")} />
                  </button>
                </li>
              )}
            </>
          )}
        </ul>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="py-3">
          <SectionHeader label="Бренд" open={brandsOpen} onToggle={() => setBrandsOpen((v) => !v)} />
          {brandsOpen && (
            <ul className="mt-2 space-y-0">
              {visibleBrands.map((b) => {
                const isActive = activeBrand === String(b.id);
                return (
                  <li key={b.id}>
                    <button
                      onClick={() => onBrand(isActive ? "" : String(b.id))}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-secondary"
                    >
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors"
                        style={{
                          borderColor: isActive ? "hsl(var(--primary))" : "hsl(var(--border))",
                          background: isActive ? "hsl(var(--primary))" : "transparent",
                        }}
                      >
                        {isActive && <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </span>
                      <span className={cn("flex-1 text-sm", isActive ? "font-semibold text-primary" : "text-foreground/80")}>
                        {b.name}
                      </span>
                    </button>
                  </li>
                );
              })}
              {brands.length > 8 && (
                <li>
                  <button onClick={() => setShowAllBrands((v) => !v)} className="flex items-center gap-1 px-2 py-1.5 text-xs text-primary hover:underline">
                    {showAllBrands ? "Скрыть" : `Ещё ${brands.length - 8}`}
                    <ChevronDown className={cn("h-3 w-3 transition-transform", showAllBrands && "rotate-180")} />
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      )}

      {/* Price */}
      <div className="py-3">
        <SectionHeader label="Цена (сом)" open={priceOpen} onToggle={() => setPriceOpen((v) => !v)} />
        {priceOpen && (
          <form onSubmit={handlePriceSubmit} className="mt-2 space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                placeholder="От"
                className="h-8 w-full min-w-0 rounded-lg border px-2 text-sm outline-none focus:border-primary"
                style={{ borderColor: "hsl(var(--border))" }}
              />
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                placeholder="До"
                className="h-8 w-full min-w-0 rounded-lg border px-2 text-sm outline-none focus:border-primary"
                style={{ borderColor: "hsl(var(--border))" }}
              />
            </div>
            <button
              type="submit"
              className="h-8 w-full rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Применить
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}

/* ─── Skeleton card ─── */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border bg-white overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
      <div className="aspect-square bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-16 rounded bg-gray-100" />
        <div className="h-3.5 w-full rounded bg-gray-100" />
        <div className="h-3.5 w-3/4 rounded bg-gray-100" />
        <div className="h-5 w-24 rounded bg-gray-100 mt-3" />
      </div>
    </div>
  );
}

/* ─── Pagination ─── */
/* ─── List-view product row ─── */
function ProductRow({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const img = product.images?.find((i) => i.isMain) || product.images?.[0];
  const discount = product.oldPrice ? Math.round((1 - Number(product.price) / Number(product.oldPrice)) * 100) : null;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const item = await addToCart(product.id, 1);
      addItem(item);
    } catch {
      addItem({ id: Date.now(), quantity: 1, productId: product.id, product: { id: product.id, name: product.name, slug: product.slug, price: product.price, images: product.images } });
    }
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex gap-4 rounded-xl border bg-white p-3 hover:shadow-md hover:border-primary/30 transition-all"
      style={{ borderColor: "hsl(var(--border))" }}
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary flex items-center justify-center">
        {img ? (
          <Image src={img.url} alt={product.name} fill className="object-contain p-1" unoptimized />
        ) : (
          <Search className="h-8 w-8 text-muted-foreground/30" />
        )}
        {discount && (
          <span className="absolute top-1 left-1 rounded bg-red-500 px-1 py-0.5 text-[9px] font-bold text-white">-{discount}%</span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          {product.brand && <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{product.brand.name}</p>}
          <h3 className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
          {product.shortDescription && <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{product.shortDescription}</p>}
        </div>
        <div className="flex items-center justify-between gap-3 mt-2">
          <div>
            <span className="text-lg font-bold text-red-600">{Number(product.price).toLocaleString()} сом</span>
            {product.oldPrice && <span className="ml-2 text-xs text-muted-foreground line-through">{Number(product.oldPrice).toLocaleString()}</span>}
          </div>
          {product.stock > 0 ? (
            <button
              onClick={handleAdd}
              className="shrink-0 rounded-lg px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#003d8f,#0077e6)" }}
            >
              В корзину
            </button>
          ) : (
            <span className="shrink-0 rounded-lg bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-500">Нет в наличии</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Main ─── */
export default function CatalogContent() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const categorySlug = params.get("category") || "";
  const brandId      = params.get("brand") || "";
  const search       = params.get("search") || "";
  const minPrice     = params.get("minPrice") || "";
  const maxPrice     = params.get("maxPrice") || "";
  const sort         = params.get("sort") || "";
  const pageParam    = Number(params.get("page") || "1");

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [data, setData] = useState<{ items: Product[]; total: number; totalPages: number }>({ items: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getBrands().then(setBrands).catch(() => {});
  }, []);

  const updateUrl = useCallback((updates: Record<string, string>) => {
    const sp = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) sp.set(k, v); else sp.delete(k);
    });
    if (!("page" in updates)) sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }, [params, router, pathname]);

  useEffect(() => {
    setLoading(true);
    const qp: Record<string, string | number> = { page: pageParam, limit: 24 };
    if (categorySlug) qp.category = categorySlug;
    if (brandId)      qp.brand = brandId;
    if (search)       qp.search = search;
    if (minPrice)     qp.minPrice = minPrice;
    if (maxPrice)     qp.maxPrice = maxPrice;
    if (sort)         qp.sort = sort;
    getProducts(qp).then((d) => {
      setData({ items: d.items ?? [], total: d.total ?? 0, totalPages: d.totalPages ?? 1 });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [categorySlug, brandId, search, minPrice, maxPrice, sort, pageParam]);

  const handleReset = () => router.push(pathname);

  // Resolve category hierarchy
  const allFlat = categories;
  const activeCategory   = allFlat.find((c) => c.slug === categorySlug);
  const parentCategory   = activeCategory?.parentId
    ? allFlat.find((c) => c.id === activeCategory.parentId)
    : activeCategory;
  const subcatsToShow    = parentCategory?.subcategories?.length
    ? parentCategory.subcategories
    : activeCategory?.subcategories ?? [];

  const hasFilters = !!(categorySlug || brandId || minPrice || maxPrice);

  const SidebarContent = (
    <Sidebar
      categories={categories}
      brands={brands}
      activeCategory={categorySlug}
      activeBrand={brandId}
      minPrice={minPrice}
      maxPrice={maxPrice}
      onCategory={(slug) => { updateUrl({ category: slug }); setShowFilters(false); }}
      onBrand={(id) => { updateUrl({ brand: id }); setShowFilters(false); }}
      onPrice={(min, max) => { updateUrl({ minPrice: min, maxPrice: max }); setShowFilters(false); }}
      onReset={() => { handleReset(); setShowFilters(false); }}
    />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-5">
      {/* Breadcrumb */}
      <Breadcrumb category={activeCategory} parentCategory={parentCategory} />

      {/* Page title */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold sm:text-2xl">
            {search ? (
              <span className="flex items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground" />
                Поиск: «{search}»
              </span>
            ) : activeCategory?.name ?? "Каталог товаров"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading ? "Загрузка..." : `${data.total.toLocaleString()} товаров`}
          </p>
        </div>
      </div>

      {/* Subcategory tiles — shown when parent category active */}
      {!search && subcatsToShow.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {subcatsToShow.map((sub) => (
            <button
              key={sub.id}
              onClick={() => updateUrl({ category: sub.slug })}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                categorySlug === sub.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-white text-foreground hover:border-primary hover:text-primary"
              )}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-5">
        {/* Desktop sidebar */}
        <div className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border bg-white px-4 py-3" style={{ borderColor: "hsl(var(--border))" }}>
            {SidebarContent}
          </div>
        </div>

        {/* Mobile sidebar drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 overflow-y-auto bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-bold">Фильтры</span>
                <button onClick={() => setShowFilters(false)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {SidebarContent}
            </div>
          </div>
        )}

        {/* Right area */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="mb-4 flex items-center gap-3 rounded-xl border bg-white px-4 py-2.5" style={{ borderColor: "hsl(var(--border))" }}>
            {/* Mobile filter btn */}
            <button
              onClick={() => setShowFilters(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors lg:hidden",
                hasFilters ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-secondary"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Фильтры
              {hasFilters && <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">!</span>}
            </button>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => updateUrl({ sort: e.target.value })}
              className="h-8 min-w-0 flex-1 rounded-lg border bg-transparent px-2 text-sm outline-none focus:border-primary sm:flex-none sm:w-48"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn("flex h-8 w-8 items-center justify-center rounded-lg border transition-colors", viewMode === "grid" ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-secondary")}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn("flex h-8 w-8 items-center justify-center rounded-lg border transition-colors", viewMode === "list" ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-secondary")}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active filters chips */}
          {hasFilters && (
            <div className="mb-3 flex flex-wrap gap-2">
              {categorySlug && activeCategory && (
                <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 pl-3 pr-2 py-1 text-xs font-medium text-primary">
                  {activeCategory.name}
                  <button onClick={() => updateUrl({ category: "" })} className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-primary/20"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}
              {brandId && (
                <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 pl-3 pr-2 py-1 text-xs font-medium text-primary">
                  {brands.find((b) => String(b.id) === brandId)?.name ?? "Бренд"}
                  <button onClick={() => updateUrl({ brand: "" })} className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-primary/20"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 pl-3 pr-2 py-1 text-xs font-medium text-primary">
                  {minPrice && maxPrice ? `${minPrice} – ${maxPrice} сом` : minPrice ? `от ${minPrice} сом` : `до ${maxPrice} сом`}
                  <button onClick={() => updateUrl({ minPrice: "", maxPrice: "" })} className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-primary/20"><X className="h-2.5 w-2.5" /></button>
                </span>
              )}
            </div>
          )}

          {/* Products */}
          {loading ? (
            viewMode === "grid" ? (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-28 animate-pulse rounded-xl border bg-white" style={{ borderColor: "hsl(var(--border))" }} />
                ))}
              </div>
            )
          ) : data.items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border bg-white py-20 text-center" style={{ borderColor: "hsl(var(--border))" }}>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Search className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Товары не найдены</h3>
                <p className="mt-1 text-sm text-muted-foreground">Попробуйте изменить фильтры или поисковый запрос</p>
              </div>
              <button
                onClick={handleReset}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
                  {data.items.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {data.items.map((p) => <ProductRow key={p.id} product={p} />)}
                </div>
              )}

              <Pagination
                current={pageParam}
                total={data.totalPages}
                onChange={(p) => updateUrl({ page: String(p) })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
