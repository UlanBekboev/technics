'use client';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { addToCart } from '@/lib/api';
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
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const router = useRouter();

  const img = product.images?.find((i) => i.isMain) || product.images?.[0];
  const discount = product.oldPrice
    ? Math.round((1 - Number(product.price) / Number(product.oldPrice)) * 100)
    : null;

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
    router.push('/cart');
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square bg-white overflow-hidden">
        {img ? (
          <img
            src={img.url}
            alt={product.name}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
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
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-end justify-center pb-3">
            <span className="text-xs text-gray-400 font-medium">Нет в наличии</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {product.brand && (
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">
            {product.brand.name}
          </span>
        )}
        <h3 className="text-xs font-medium text-gray-700 line-clamp-2 flex-1 leading-snug group-hover:text-blue-700 transition-colors">
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

          {/* Cart button — hidden by default, slides up on hover */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="mt-2 w-full flex items-center justify-center gap-1.5 text-white text-xs font-semibold py-2 rounded-lg transition-all duration-200
                       opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
                       disabled:opacity-0 disabled:pointer-events-none"
            style={{ background: 'linear-gradient(135deg, #003d8f, #0077e6)' }}
          >
            <ShoppingCart size={13} />
            В корзину
          </button>
        </div>
      </div>
    </Link>
  );
}
