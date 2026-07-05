'use client';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useFavoritesStore } from '@/store/favorites';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { addToCart, toggleFavorite } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  images: { url: string; isMain: boolean }[];
  brand?: { name: string };
  stock: number;
  isNew?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const { has, toggle } = useFavoritesStore();
  const { user } = useAuthStore();
  const { show } = useToastStore();
  const router = useRouter();

  const img = product.images?.find((i) => i.isMain) || product.images?.[0];
  const discount = product.oldPrice
    ? Math.round((1 - Number(product.price) / Number(product.oldPrice)) * 100)
    : null;
  const isFav = has(product.id);

  const isHit = !!product.oldPrice;
  const isNew = product.isNew && !isHit;

  const handleAddToCart = async (e: React.MouseEvent) => {
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
    show('Товар добавлен в корзину');
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { router.push('/login'); return; }
    toggle(product.id);
    try {
      await toggleFavorite(product.id);
    } catch {
      toggle(product.id);
    }
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group bg-white rounded-xl border border-gray-100 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square bg-white overflow-hidden">
        {img ? (
          <img
            src={img.url}
            alt={product.name}
            className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <ShoppingCart size={40} strokeWidth={1} />
          </div>
        )}

        {/* Бейджи */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && (
            <span className="badge-pulse bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              -{discount}%
            </span>
          )}
          {isHit && !discount && (
            <span className="badge-pulse bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              ХИТ
            </span>
          )}
          {isNew && (
            <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              НОВИНКА
            </span>
          )}
        </div>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/50" />
        )}

        {/* Кнопка избранного */}
        <button
          onClick={handleFavorite}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
        >
          <Heart
            size={14}
            className={isFav ? 'text-red-500 fill-red-500' : 'text-gray-400'}
          />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {product.brand && (
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">
            {product.brand.name}
          </span>
        )}
        <h3 className="text-xs font-medium text-gray-700 line-clamp-2 flex-1 leading-snug group-hover:text-blue-700 transition-colors duration-200">
          {product.name}
        </h3>

        <div className="mt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold" style={{ color: '#E53E3E' }}>
              {Number(product.price).toLocaleString()} сом
            </span>
            {product.oldPrice && (
              <span className="text-xs text-gray-400 line-through">
                {Number(product.oldPrice).toLocaleString()}
              </span>
            )}
          </div>

          {product.stock === 0 ? (
            <div className="mt-2 w-full flex items-center justify-center text-white text-xs font-semibold py-2 rounded-lg bg-red-500">
              Нет в наличии
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="mt-2 w-full flex items-center justify-center gap-1.5 text-white text-xs font-semibold py-2 rounded-lg transition-all duration-200
                         md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0
                         hover:brightness-110 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #003d8f, #0077e6)' }}
            >
              <ShoppingCart size={13} />
              В корзину
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
