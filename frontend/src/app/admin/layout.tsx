"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Tag, ListOrdered, LogOut,
  Image, Settings, MessageSquare, Layers, Megaphone
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Заказы", icon: ListOrdered },
  { href: "/admin/products", label: "Товары", icon: ShoppingBag },
  { href: "/admin/categories", label: "Категории", icon: Tag },
  { href: "/admin/brands", label: "Бренды", icon: Layers },
  { href: "/admin/banners", label: "Баннеры", icon: Image },
  { href: "/admin/aktsii", label: "Акции", icon: Megaphone },
  { href: "/admin/messages", label: "Сообщения", icon: MessageSquare },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, logout, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) router.push("/login");
    else if (user.role !== "ADMIN") router.push("/");
  }, [user, hasHydrated]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col bg-foreground text-white lg:flex sticky top-0 h-screen">
        <div className="flex h-14 items-center gap-2 border-b border-white/10 px-4">
          <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-black hover:opacity-80">
            T
          </Link>
          <span className="text-sm font-bold text-white/80">Панель управления</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? path === href : path.startsWith(href) && href !== "/admin";
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          {user && <p className="mb-2 truncate text-xs text-white/50">{user.name}</p>}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-foreground px-4 text-white lg:hidden"
        style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-2">
          <Link href="/" className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-black">T</Link>
          <span className="text-sm font-semibold text-white/80">Admin</span>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {NAV.slice(0, 5).map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? path === href : path.startsWith(href) && href !== "/admin";
            return (
              <Link key={href} href={href}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap",
                  active ? "bg-primary text-primary-foreground" : "text-white/60 hover:text-white"
                )}>
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
        <button onClick={handleLogout} className="text-white/60 hover:text-white">
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-x-hidden bg-secondary/30 lg:min-h-screen">
        {children}
      </main>
    </div>
  );
}
