'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { createOrder } from '@/lib/api';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const { items, total, clearCart } = useCartStore();

  useEffect(() => { setMounted(true); }, []);
  const router = useRouter();

  if (success) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Заказ оформлен!</h2>
        <p className="text-gray-500 mb-6">Мы свяжемся с вами в ближайшее время</p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          На главную
        </Link>
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError('');
    try {
      await createOrder(address, comment);
      clearCart();
      setSuccess(true);
    } catch {
      setError('Ошибка при оформлении заказа. Войдите в аккаунт.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Оформление заказа</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Данные доставки</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Адрес доставки</label>
                <input
                  value={address} onChange={(e) => setAddress(e.target.value)} required
                  placeholder="г. Бишкек, ул. Примерная 1, кв. 1"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-gray-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Комментарий (необязательно)</label>
                <textarea
                  value={comment} onChange={(e) => setComment(e.target.value)}
                  placeholder="Время доставки, особые пожелания..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-gray-50 resize-none"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit" disabled={loading || (mounted && items.length === 0)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            {loading ? 'Оформляем...' : 'Подтвердить заказ'}
          </button>
        </form>

        <div className="bg-white rounded-2xl border p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Ваш заказ</h2>
          <div className="space-y-3 mb-4">
            {mounted && items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600 line-clamp-1 flex-1 mr-2">{item.product.name} × {item.quantity}</span>
                <span className="font-medium flex-shrink-0">{(Number(item.product.price) * item.quantity).toLocaleString()} сом</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between font-bold">
            <span>Итого:</span>
            <span className="text-blue-600 text-lg" suppressHydrationWarning>
              {mounted ? total().toLocaleString() : '0'} сом
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
