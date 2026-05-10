'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Star, Check, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProduct, getFeatured, getProducts, addToCart } from '@/lib/api';
import { useCartStore } from '@/store/cart';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

const PHONES = ['+996 700 916 121', '+996 551 916 122'];

function ProductCarousel({ title, items }: { title: string; items: any[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;
    const t = setInterval(() => {
      const el = ref.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= max - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
        setIdx(0);
      } else {
        el.scrollBy({ left: 220, behavior: 'smooth' });
        setIdx((i) => i + 1);
      }
    }, 3000);
    return () => clearInterval(t);
  }, [items]);

  const scroll = (dir: 'prev' | 'next') => {
    ref.current?.scrollBy({ left: dir === 'next' ? 220 : -220, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'linear-gradient(to bottom, #003d8f, #0077e6)' }} />
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('prev')}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-blue-400 hover:text-blue-600 transition-colors text-gray-500"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll('next')}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-blue-400 hover:text-blue-600 transition-colors text-gray-500"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div ref={ref} className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {items.map((p) => (
          <div key={p.id} className="w-[200px] flex-shrink-0">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct]       = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [adding, setAdding]         = useState(false);
  const [activeTab, setActiveTab]   = useState<'desc' | 'reviews'>('desc');
  const [related, setRelated]       = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);

  const { addItem } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    setSelectedImg(0);
    getProduct(slug)
      .then((p) => {
        setProduct(p);
        // Fetch related (same category)
        if (p?.category?.slug) {
          getProducts({ category: p.category.slug, limit: 10 })
            .then((r: any) => setRelated((r.items ?? []).filter((x: any) => x.id !== p.id)))
            .catch(() => {});
        }
        // Fetch recommended
        getFeatured()
          .then((items: any[]) => setRecommended(items.filter((x) => x.id !== p.id).slice(0, 10)))
          .catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      const item = await addToCart(product.id, 1);
      addItem(item);
    } catch {
      addItem({ id: Date.now(), quantity: 1, productId: product.id, product });
    } finally {
      setAdding(false);
      router.push('/cart');
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square bg-gray-100 rounded-2xl" />
        <div className="space-y-4 pt-4">
          <div className="h-5 bg-gray-100 rounded w-1/4" />
          <div className="h-8 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-10 bg-gray-100 rounded w-1/3 mt-6" />
          <div className="h-12 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">
      <p className="text-xl mb-3">Товар не найден</p>
      <Link href="/catalog" className="text-blue-600 hover:underline text-sm">Вернуться в каталог</Link>
    </div>
  );

  const images    = product.images || [];
  const mainImg   = images[selectedImg] || images[0];
  const avgRating = product.reviews?.length
    ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length
    : 0;
  const reviewCount = product.reviews?.length ?? 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition-colors">Главная</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-blue-600 transition-colors">Каталог товаров</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/catalog?category=${product.category.slug}`} className="hover:text-blue-600 transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-600 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="grid md:grid-cols-[45%_55%] gap-8">

            {/* ── Left: Images ── */}
            <div>
              <div className="border border-gray-100 rounded-xl flex items-center justify-center bg-white overflow-hidden" style={{ minHeight: 340 }}>
                {mainImg ? (
                  <img
                    src={mainImg.url}
                    alt={product.name}
                    className="max-h-80 max-w-full object-contain p-4"
                  />
                ) : (
                  <div className="text-gray-200 flex flex-col items-center gap-2">
                    <ShoppingCart size={64} strokeWidth={1} />
                    <span className="text-sm text-gray-300">Нет изображения</span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {images.map((img: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      className={`w-16 h-16 flex-shrink-0 rounded-lg border-2 p-1 transition-all ${
                        i === selectedImg ? 'border-blue-500 shadow-sm' : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Info ── */}
            <div className="flex flex-col">
              {/* Brand */}
              {product.brand && (
                <span className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#0057B8' }}>
                  {product.brand.name}
                </span>
              )}

              {/* Name */}
              <h1 className="text-xl font-bold text-gray-900 leading-snug mb-2">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <Star
                      key={s}
                      size={13}
                      className={s <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {reviewCount > 0
                    ? `${reviewCount} отзыв${reviewCount === 1 ? '' : reviewCount < 5 ? 'а' : 'ов'}`
                    : 'нет отзывов, будьте первым кто напишет отзыв'}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4">
                {/* Stock + Price */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`flex items-center gap-1.5 text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {product.stock > 0 ? (
                      <><Check size={15} className="bg-green-500 text-white rounded-full p-0.5" /> В наличии</>
                    ) : (
                      'Нет в наличии'
                    )}
                  </span>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: '#E53E3E' }}>
                      {Number(product.price).toLocaleString()} сом
                    </div>
                    {product.oldPrice && (
                      <div className="text-sm text-gray-400 line-through text-right">
                        {Number(product.oldPrice).toLocaleString()} сом
                      </div>
                    )}
                  </div>
                </div>

                {/* Add to cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || adding}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white text-sm transition-all mb-4 disabled:bg-gray-200 disabled:cursor-not-allowed"
                  style={product.stock > 0 ? { background: 'linear-gradient(135deg, #003d8f, #0077e6)' } : {}}
                >
                  <ShoppingCart size={17} /> В корзину
                </button>

                {/* Phones */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Уточнить наличие по телефонам:
                  </p>
                  <div className="flex flex-col gap-2">
                    {PHONES.map((phone) => (
                      <a
                        key={phone}
                        href={`tel:${phone.replace(/\s/g, '')}`}
                        className="flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
                        style={{ color: '#0057B8' }}
                      >
                        <Phone size={14} />
                        {phone}
                      </a>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-gray-100">
                    <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-500">г. Бишкек</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: description / reviews */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(['desc', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'desc' ? 'Полное описание' : `Отзывы покупателей (${reviewCount})`}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === 'desc' ? (
              <div>
                {product.description ? (
                  <p className="text-sm text-gray-600 leading-relaxed mb-6 whitespace-pre-line">{product.description}</p>
                ) : (
                  <p className="text-sm text-gray-400 mb-6">Описание не добавлено</p>
                )}
                {product.specs?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Характеристики:</h3>
                    <div className="divide-y divide-gray-100">
                      {product.specs.map((spec: any) => (
                        <div key={spec.id} className="flex py-2.5 text-sm">
                          <span className="text-gray-500 w-1/2">· {spec.key}</span>
                          <span className="text-gray-800 font-medium">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {reviewCount === 0 ? (
                  <p className="text-sm text-gray-400">Отзывов пока нет. Будьте первым!</p>
                ) : (
                  <div className="space-y-4">
                    {product.reviews.map((r: any) => (
                      <div key={r.id} className="border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex">
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} size={12} className={s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} />
                            ))}
                          </div>
                          <span className="text-xs font-medium text-gray-700">{r.user?.name}</span>
                        </div>
                        {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Часто просматриваемые (related by category) */}
        <ProductCarousel title="Покупатели также смотрели" items={related} />

        {/* Рекомендованные */}
        <ProductCarousel title="Рекомендованные товары" items={recommended} />

      </div>
    </div>
  );
}
