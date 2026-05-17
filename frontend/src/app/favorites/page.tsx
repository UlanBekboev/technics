'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useFavoritesStore } from '@/store/favorites';
import { useCartStore } from '@/store/cart';
import { getFavorites, toggleFavorite, addToCart } from '@/lib/api';

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  stock: number;
  brand?: { name: string };
  images: { url: string; isMain: boolean }[];
};

export default function FavoritesPage() {
  const { user } = useAuthStore();
  const { ids, setIds, toggle } = useFavoritesStore();
  const { addItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getFavorites()
      .then((favs) => {
        setProducts(favs.map((f: any) => f.product));
        setIds(favs.map((f: any) => f.product.id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  async function handleToggle(productId: number) {
    if (!user) return;
    toggle(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      await toggleFavorite(productId);
    } catch {
      toggle(productId);
    }
  }

  async function handleAddToCart(e: React.MouseEvent, product: Product) {
    e.preventDefault();
    try {
      const item = await addToCart(product.id, 1);
      addItem(item);
    } catch {
      addItem({
        id: Date.now(),
        quantity: 1,
        productId: product.id,
        product: { id: product.id, name: product.name, slug: product.slug, price: product.price, images: product.images },
      });
    }
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-400 text-sm">Загрузка...</div>
  );

  if (!user) return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-center">
      <Heart size={48} className="mx-auto text-gray-200 mb-4" />
      <p className="text-gray-500 mb-4">Войдите, чтобы видеть избранные товары</p>
      <Link href="/login" className="inline-block text-white text-sm font-semibold px-6 py-2.5 rounded-lg" style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}>
        Войти
      </Link>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
          <Heart size={22} className="text-red-500 fill-red-500" />
          Избранное
          {products.length > 0 && <span className="text-base font-normal text-gray-400">({products.length})</span>}
        </h1>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-20 text-center">
            <Heart size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 text-sm mb-4">Вы ещё не добавили товары в избранное</p>
            <Link href="/catalog" className="inline-block text-white text-sm font-semibold px-6 py-2.5 rounded-lg" style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}>
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map((product) => {
              const img = product.images?.find((i) => i.isMain) ?? product.images?.[0];
              const discount = product.oldPrice
                ? Math.round((1 - Number(product.price) / Number(product.oldPrice)) * 100)
                : null;
              return (
                <div key={product.id} className="group bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-200 overflow-hidden flex flex-col">
                  <Link href={`/product/${product.slug}`} className="relative aspect-square bg-white overflow-hidden block">
                    {img ? (
                      <img src={img.url} alt={product.name} className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <ShoppingCart size={40} strokeWidth={1} />
                      </div>
                    )}
                    {discount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        -{discount}%
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); handleToggle(product.id); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center transition-transform hover:scale-110"
                    >
                      <Heart size={14} className="text-red-500 fill-red-500" />
                    </button>
                  </Link>

                  <div className="p-3 flex flex-col flex-1">
                    {product.brand && (
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">{product.brand.name}</span>
                    )}
                    <Link href={`/product/${product.slug}`} className="text-xs font-medium text-gray-700 line-clamp-2 flex-1 leading-snug hover:text-blue-700 transition-colors">
                      {product.name}
                    </Link>

                    <div className="mt-2.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold" style={{ color: '#E53E3E' }}>
                          {Number(product.price).toLocaleString()} сом
                        </span>
                        {product.oldPrice && (
                          <span className="text-xs text-gray-400 line-through">{Number(product.oldPrice).toLocaleString()}</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.stock === 0}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 text-white text-xs font-semibold py-2 rounded-lg transition-all disabled:opacity-40 disabled:pointer-events-none"
                        style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}
                      >
                        <ShoppingCart size={13} />
                        {product.stock === 0 ? 'Нет в наличии' : 'В корзину'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
