'use client';
import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const STATUSES = [
  { value: 'PENDING',   label: 'Ожидает',      color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'CONFIRMED', label: 'Подтверждён',   color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'SHIPPED',   label: 'Доставляется',  color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'DELIVERED', label: 'Доставлен',     color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'CANCELLED', label: 'Отменён',       color: 'bg-red-100 text-red-800 border-red-200' },
];

function statusMeta(val: string) {
  return STATUSES.find(s => s.value === val) ?? { value: val, label: val, color: 'bg-gray-100 text-gray-700 border-gray-200' };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    // Auth/role redirect is handled by admin/layout.tsx.
    if (!user || user.role !== 'ADMIN') return;
    getAllOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleStatus = async (orderId: number, status: string) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch {}
    setUpdating(null);
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-400 text-sm">Загрузка...</div>
  );

  const counts = STATUSES.reduce((acc, s) => {
    acc[s.value] = orders.filter(o => o.status === s.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-gray-50 min-h-screen overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-3 xs:px-4 py-6 xs:py-8">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Все заказы</h1>
          <span className="text-sm text-gray-400">Всего: {orders.length}</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 2xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
          {STATUSES.map(s => (
            <div key={s.value} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{counts[s.value] ?? 0}</div>
              <div className={`text-xs font-medium mt-1 px-2 py-0.5 rounded-full inline-block ${s.color}`}>{s.label}</div>
            </div>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
            Заказов пока нет
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const s = statusMeta(order.status);
              return (
                <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">

                  {/* ── Шапка: номер + сумма ── */}
                  <div className="flex items-center justify-between px-3 xs:px-5 py-3 border-b border-gray-50">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-gray-900 whitespace-nowrap">Заказ #{order.id}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${s.color}`}>{s.label}</span>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0 ml-2">
                      <span className="font-bold text-base xs:text-xl whitespace-nowrap" style={{ color: '#C01D2E' }}>
                        {Number(order.total).toLocaleString('ru')} сом
                      </span>
                      <span className="text-[10px] xs:text-xs text-gray-400 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* ── Клиент + адрес ── */}
                  <div className="px-3 xs:px-5 py-2.5 border-b border-gray-50 text-sm text-gray-600 space-y-0.5">
                    <div className="flex items-baseline gap-1 min-w-0">
                      <span>👤</span>
                      <span className="font-medium truncate">{order.user?.name}</span>
                      <span className="text-gray-400 truncate text-xs">{order.user?.email}</span>
                    </div>
                    {order.user?.phone && <div className="truncate">📞 {order.user.phone}</div>}
                    {order.address    && <div className="truncate">📍 {order.address}</div>}
                    {order.comment    && <div className="text-gray-400 italic truncate">💬 {order.comment}</div>}
                  </div>

                  {/* ── Товары ── */}
                  <div className="px-3 xs:px-5 py-2.5 border-b border-gray-50 space-y-1">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm gap-2">
                        <span className="text-gray-600 truncate flex-1">{item.product.name} × {item.quantity}</span>
                        <span className="text-gray-700 font-medium flex-shrink-0 whitespace-nowrap">
                          {(Number(item.price) * item.quantity).toLocaleString('ru')} сом
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* ── Статус (полная ширина) ── */}
                  <div className="px-3 xs:px-5 py-3">
                    <select
                      value={order.status}
                      disabled={updating === order.id}
                      onChange={e => handleStatus(order.id, e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-400 cursor-pointer disabled:opacity-50"
                    >
                      {STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
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
