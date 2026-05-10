'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Trash2, ShoppingCart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { updateCartItem, removeFromCart, getFeatured } from '@/lib/api';

export default function CartPage() {
  const { items, updateItem, removeItem, total } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [recommended, setRecommended] = useState<any[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getFeatured().then(setRecommended).catch(() => {});
  }, []);

  useEffect(() => {
    if (recommended.length === 0) return;
    const t = setInterval(() => {
      const el = carouselRef.current;
      if (!el) return;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 250, behavior: 'smooth' });
      }
    }, 3000);
    return () => clearInterval(t);
  }, [recommended]);

  const scrollCarousel = (dir: 'prev' | 'next') =>
    carouselRef.current?.scrollBy({ left: dir === 'next' ? 250 : -250, behavior: 'smooth' });

  const handleQtyChange = async (productId: number, qty: number) => {
    if (qty < 1) return;
    updateItem(productId, qty);
    try { await updateCartItem(productId, qty); } catch {}
  };

  const handleRemove = async (productId: number) => {
    removeItem(productId);
    try { await removeFromCart(productId); } catch {}
  };

  const handleCheckout = () => {
    if (!isAuthenticated()) { setShowAuthPopup(true); return; }
    window.location.href = '/checkout';
  };

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center py-16">
          <ShoppingCart size={72} className="text-gray-200 mx-auto mb-4" strokeWidth={1} />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Корзина пуста</h2>
          <p className="text-gray-400 text-sm mb-6">Добавьте товары из каталога</p>
          <Link href="/catalog"
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-lg"
            style={{ background: '#0057B8' }}>
            Перейти в каталог <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-gray-400 mb-4">
          <Link href="/" className="hover:text-gray-600">Главная</Link>
          <span className="mx-1">›</span>
          <span className="text-gray-600">Корзина товаров</span>
          {[0,1,2].map(i => <span key={i} className="flex items-center gap-1"><span className="mx-1">›</span><span className="w-3 h-1 rounded-sm bg-gray-300 inline-block" /></span>)}
        </nav>

        {/* Table */}
        <div className="bg-white border border-gray-200 mb-3">
          {/* Header */}
          <div
            className="grid border-b border-gray-200 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600"
            style={{ gridTemplateColumns: '108px 1fr 150px 130px 140px 44px' }}
          >
            <span>Фото</span>
            <span>Название товара</span>
            <span className="text-center">Кол-во</span>
            <span className="text-right">Цена за единицу</span>
            <span className="text-right">Общая стоимость</span>
            <span />
          </div>

          {/* Rows */}
          {items.map((item) => {
            const img = item.product.images?.find((i: any) => i.isMain) || item.product.images?.[0];
            const lineTotal = Number(item.product.price) * item.quantity;
            return (
              <div
                key={item.id}
                className="grid border-b border-gray-100 last:border-0 px-4 py-3 items-center"
                style={{ gridTemplateColumns: '108px 1fr 150px 130px 140px 44px' }}
              >
                {/* Photo */}
                <Link href={`/product/${item.product.slug}`}>
                  <div className="w-20 h-20 border border-gray-200 flex items-center justify-center bg-white overflow-hidden">
                    {img
                      ? <img src={img.url} alt="" className="w-full h-full object-contain p-1" />
                      : <ShoppingCart size={22} className="text-gray-200" />}
                  </div>
                </Link>

                {/* Name */}
                <Link
                  href={`/product/${item.product.slug}`}
                  className="text-sm text-gray-800 hover:text-blue-700 transition-colors leading-snug pr-3"
                >
                  {item.product.name}
                </Link>

                {/* Qty */}
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => handleQtyChange(item.productId, item.quantity - 1)}
                    className="w-8 h-8 border border-gray-300 flex items-center justify-center text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors font-bold text-lg leading-none"
                  >−</button>
                  <span className="w-9 text-center text-sm font-semibold text-gray-800 border-y border-gray-300 h-8 flex items-center justify-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQtyChange(item.productId, item.quantity + 1)}
                    className="w-8 h-8 border border-gray-300 flex items-center justify-center text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors font-bold text-lg leading-none"
                  >+</button>
                </div>

                {/* Unit price */}
                <div className="text-right text-sm text-gray-700">
                  {Number(item.product.price).toLocaleString()}
                </div>

                {/* Line total */}
                <div className="text-right text-sm font-bold" style={{ color: '#C01D2E' }}>
                  {lineTotal.toLocaleString()}
                </div>

                {/* Delete */}
                <div className="flex justify-center">
                  <button onClick={() => handleRemove(item.productId)}
                    className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Итого */}
          <div className="flex justify-end items-center px-6 py-3 border-t border-gray-200 bg-gray-50">
            <span className="text-sm text-gray-600 mr-2">Итого:</span>
            <span className="text-lg font-bold" style={{ color: '#C01D2E' }}>
              {total().toLocaleString()} сом
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mb-8">
          <Link
            href="/catalog"
            className="flex-1 text-center text-sm font-medium py-3.5 border border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all bg-white"
          >
            Продолжить покупки
          </Link>
          <button
            onClick={handleCheckout}
            className="flex-1 text-sm font-bold text-white py-3.5 transition-opacity hover:opacity-90"
            style={{ background: '#C01D2E' }}
          >
            Оформить доставку
          </button>
        </div>

        {/* С этим товаром покупают */}
        {recommended.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">С этим товаром покупают</h2>
              <div className="flex gap-1">
                <button
                  onClick={() => scrollCarousel('prev')}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scrollCarousel('next')}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none' }}
            >
              {recommended.map((p) => {
                const img = p.images?.find((i: any) => i.isMain) || p.images?.[0];
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="flex-shrink-0 w-[230px] bg-white border border-gray-200 hover:shadow-md transition-shadow group"
                  >
                    <div className="w-full aspect-square overflow-hidden bg-white">
                      {img
                        ? <img
                            src={img.url}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        : <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <ShoppingCart size={40} className="text-gray-200" />
                          </div>
                      }
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-700 line-clamp-2 leading-snug mb-1.5 group-hover:text-blue-700 transition-colors">
                        {p.name}
                      </p>
                      <p className="text-sm font-bold" style={{ color: '#C01D2E' }}>
                        {Number(p.price).toLocaleString()} сом
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Auth popup */}
      {showAuthPopup && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAuthPopup(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Требуется вход</h3>
            <p className="text-sm mb-6" style={{ color: '#0057B8' }}>Пожалуйста, сначала авторизуйтесь.</p>
            <Link
              href="/login?redirect=%2Fcart"
              className="block w-full text-white font-bold py-3 rounded-lg uppercase tracking-wide text-sm mb-3 hover:opacity-90"
              style={{ background: '#C01D2E' }}
            >
              Авторизоваться
            </Link>
            <button
              onClick={() => setShowAuthPopup(false)}
              className="text-sm text-gray-400 hover:text-gray-700"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
