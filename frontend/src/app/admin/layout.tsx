'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Tag, ListOrdered, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';

const NAV = [
  { href: '/admin/orders',     label: 'Заказы',     icon: ListOrdered },
  { href: '/admin/products',   label: 'Товары',     icon: ShoppingBag },
  { href: '/admin/categories', label: 'Категории',  icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.push('/');
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin top bar */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm hover:opacity-80 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }} title="На главную">
              T
            </Link>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
              <LayoutDashboard size={14} />
              Панель управления
            </div>
          </div>

          {/* Nav tabs */}
          <nav className="flex gap-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  path === href
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-xs text-gray-400 hidden sm:block">{user.name}</span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
