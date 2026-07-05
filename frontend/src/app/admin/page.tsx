"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag, ListOrdered, Tag, Package,
  TrendingUp, Users, MessageSquare, Image, Layers
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { getAllOrders, adminGetProducts, getCategories, getBrands, adminGetMessages } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const ORDER_STATUSES: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "Ожидает",     cls: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "Подтверждён", cls: "bg-blue-100 text-blue-700" },
  SHIPPED:   { label: "Доставляется",cls: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "Доставлен",   cls: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Отменён",     cls: "bg-red-100 text-red-700" },
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [stats, setStats] = useState({
    orders: 0, pending: 0, revenue: 0,
    products: 0, categories: 0, brands: 0, messages: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "ADMIN") { router.push("/"); return; }

    Promise.allSettled([
      getAllOrders(),
      adminGetProducts(),
      getCategories(),
      getBrands(),
      adminGetMessages(),
    ]).then(([ordersRes, productsRes, catsRes, brandsRes, msgsRes]) => {
      const orders = ordersRes.status === "fulfilled" ? ordersRes.value : [];
      const products = productsRes.status === "fulfilled" ? productsRes.value : [];
      const cats = catsRes.status === "fulfilled" ? catsRes.value : [];
      const brands = brandsRes.status === "fulfilled" ? brandsRes.value : [];
      const msgs = msgsRes.status === "fulfilled" ? msgsRes.value : [];

      const revenue = orders.reduce((s: number, o: any) => s + Number(o.total ?? 0), 0);
      const pending = orders.filter((o: any) => o.status === "PENDING").length;

      setStats({
        orders: orders.length,
        pending,
        revenue,
        products: Array.isArray(products) ? products.length : 0,
        categories: Array.isArray(cats) ? cats.length : 0,
        brands: Array.isArray(brands) ? brands.length : 0,
        messages: Array.isArray(msgs) ? msgs.filter((m: any) => !m.isRead).length : 0,
      });
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    });
  }, [user]);

  const STAT_CARDS = [
    { label: "Заказов",     value: stats.orders,     icon: ListOrdered, href: "/admin/orders",   color: "text-blue-600 bg-blue-50" },
    { label: "Ожидают",     value: stats.pending,    icon: TrendingUp,  href: "/admin/orders",   color: "text-yellow-600 bg-yellow-50" },
    { label: "Товаров",     value: stats.products,   icon: ShoppingBag, href: "/admin/products", color: "text-green-600 bg-green-50" },
    { label: "Категорий",   value: stats.categories, icon: Tag,         href: "/admin/categories",color: "text-purple-600 bg-purple-50" },
    { label: "Брендов",     value: stats.brands,     icon: Layers,      href: "/admin/brands",   color: "text-indigo-600 bg-indigo-50" },
    { label: "Сообщений",   value: stats.messages,   icon: MessageSquare,href: "/admin/messages",color: "text-red-600 bg-red-50" },
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-secondary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Дашборд</h1>
        <p className="text-sm text-muted-foreground">Добро пожаловать, {user?.name}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={href + label} href={href}
            className="rounded-xl border bg-white p-4 hover:shadow-md transition-shadow"
            style={{ borderColor: "hsl(var(--border))" }}>
            <div className={cn("mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg", color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-extrabold">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      {/* Revenue card */}
      <div className="rounded-xl border bg-white p-6" style={{ borderColor: "hsl(var(--border))" }}>
        <p className="text-sm text-muted-foreground">Общая выручка</p>
        <p className="text-3xl font-extrabold text-primary mt-1">{formatPrice(stats.revenue)}</p>
        <p className="text-xs text-muted-foreground mt-1">из {stats.orders} заказов</p>
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border bg-white" style={{ borderColor: "hsl(var(--border))" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "hsl(var(--border))" }}>
          <h2 className="font-bold">Последние заказы</h2>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">Все заказы</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Заказов пока нет</p>
        ) : (
          <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
            {recentOrders.map((order) => {
              const s = ORDER_STATUSES[order.status] ?? { label: order.status, cls: "bg-gray-100 text-gray-700" };
              return (
                <div key={order.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <span className="font-semibold text-sm">Заказ #{order.id}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{order.user?.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">{formatPrice(Number(order.total))}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", s.cls)}>{s.label}</span>
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
