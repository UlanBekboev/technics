'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight } from 'lucide-react';
import { getOrders } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Ожидает',     color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Подтверждён', color: 'bg-blue-100 text-blue-800' },
  SHIPPED:   { label: 'Доставляется',color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: 'Доставлен',   color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Отменён',     color: 'bg-red-100 text-red-800' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.push('/login?redirect=/orders'); return; }
    getOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-400 text-sm">Загрузка...</div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Мои заказы</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Package size={56} className="text-gray-200 mx-auto mb-4" strokeWidth={1} />
            <p className="text-gray-500 mb-4">У вас ещё нет заказов</p>
            <Link href="/catalog"
              className="inline-flex items-center gap-1 text-sm font-semibold text-white px-5 py-2.5 rounded-lg"
              style={{ background: '#0057B8' }}>
              Перейти в каталог <ChevronRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const s = STATUS_LABEL[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-700' };
              return (
                <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">Заказ #{order.id}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>{s.label}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 line-clamp-1 flex-1 mr-3">{item.product.name} × {item.quantity}</span>
                        <span className="text-gray-700 font-medium flex-shrink-0">
                          {(Number(item.price) * item.quantity).toLocaleString('ru')} сом
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-xs text-gray-400">📍 {order.address || '—'}</span>
                    <span className="font-bold text-sm" style={{ color: '#C01D2E' }}>
                      {Number(order.total).toLocaleString('ru')} сом
                    </span>
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
