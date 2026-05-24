'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Tag, ListOrdered } from 'lucide-react';

const NAV = [
  { href: '/admin/orders',     label: 'Заказы',     icon: ListOrdered },
  { href: '/admin/products',   label: 'Товары',     icon: ShoppingBag },
  { href: '/admin/categories', label: 'Категории',  icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 py-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  path === href
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
