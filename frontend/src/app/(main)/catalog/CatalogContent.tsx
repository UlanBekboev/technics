'use client';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { getProducts, getCategories, getBrands } from '@/lib/api';

interface SubCategory { id: number; name: string; slug: string; }
interface Category { id: number; name: string; slug: string; subcategories: SubCategory[]; }

export default function CatalogContent() {
  const params = useSearchParams();
  const [products, setProducts] = useState<any>({ items: [], total: 0, totalPages: 1 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [popupTop, setPopupTop] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const category = params.get('category') || '';
  const search = params.get('search') || '';
  const brandId = params.get('brand') || '';

  useEffect(() => {
    Promise.all([getCategories(), getBrands()]).then(([cats, brs]) => {
      setCategories(cats);
      setBrands(brs);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts({ category, search, brandId, page })
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, search, brandId, page]);

  const title = search
    ? `Поиск: "${search}"`
    : category
    ? categories.find((c) => c.slug === category)?.name ||
      categories.flatMap((c) => c.subcategories).find((s) => s.slug === category)?.name ||
      'Каталог'
    : 'Все товары';

  const clearLeave = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); };
  const scheduleClose = () => { clearLeave(); leaveTimer.current = setTimeout(() => setActiveId(null), 150); };

  const handleItemEnter = (cat: Category, el: HTMLElement) => {
    clearLeave();
    if (!cat.subcategories?.length) { setActiveId(null); return; }
    const top = sidebarRef.current?.getBoundingClientRect().top ?? 0;
    setPopupTop(el.getBoundingClientRect().top - top);
    setActiveId(cat.id);
  };

  const activeCategory = categories.find((c) => c.id === activeId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-400 mt-1">{products.total} товаров</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 border rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors md:hidden"
        >
          <SlidersHorizontal size={16} /> Фильтры
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={`relative w-56 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} md:block`}
          onMouseLeave={scheduleClose}
        >
          {/* Categories — only top level */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide px-1">Категории</h3>
            <ul>
              <li>
                <a
                  href="/catalog"
                  className={`block text-sm px-3 py-2 rounded-lg transition-colors ${!category ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-700'}`}
                >
                  Все товары
                </a>
              </li>
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  onMouseEnter={(e) => handleItemEnter(cat, e.currentTarget)}
                >
                  <a
                    href={`/catalog?category=${cat.slug}`}
                    className={`flex items-center justify-between text-sm px-3 py-2 rounded-lg transition-colors ${
                      category === cat.slug || cat.subcategories.some(s => s.slug === category)
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : activeId === cat.id
                        ? 'bg-gray-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-700'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat.subcategories?.length > 0 && (
                      <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands filter */}
          {brands.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide px-1">Бренды</h3>
              <ul>
                {brands.map((brand: any) => (
                  <li key={brand.id}>
                    <a
                      href={`/catalog?brand=${brand.id}${category ? `&category=${category}` : ''}`}
                      className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                        brandId === String(brand.id)
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-blue-700'
                      }`}
                    >
                      {brand.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Subcategory popup */}
          {activeId && activeCategory && activeCategory.subcategories.length > 0 && (
            <div
              className="absolute left-full z-50"
              style={{ top: popupTop, marginLeft: '1px' }}
              onMouseEnter={clearLeave}
              onMouseLeave={scheduleClose}
            >
              <div className="bg-white border border-gray-200 shadow-2xl w-60 py-2 rounded-sm">
                <a
                  href={`/catalog?category=${activeCategory.slug}`}
                  className="block px-4 py-2 mb-1 border-b border-gray-100 text-[11px] font-bold uppercase tracking-widest text-blue-800 hover:bg-blue-50 transition-colors"
                >
                  {activeCategory.name}
                </a>
                {activeCategory.subcategories.map((sub) => (
                  <a
                    key={sub.id}
                    href={`/catalog?category=${sub.slug}`}
                    className={`block px-4 py-2 text-sm transition-colors ${
                      category === sub.slug
                        ? 'text-blue-700 font-medium bg-blue-50'
                        : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    {sub.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : products.items.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">Товары не найдены</p>
              <a href="/catalog" className="text-blue-600 hover:underline text-sm mt-2 block">Сбросить фильтры</a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {products.items.map((p: any) => <ProductCard key={p.id} product={p} />)}
              </div>
              {products.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: products.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${page === p ? 'text-white' : 'border hover:bg-gray-50 text-gray-600'}`}
                      style={page === p ? { background: 'linear-gradient(135deg, #003d8f, #0077e6)' } : {}}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
