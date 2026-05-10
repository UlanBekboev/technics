'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Phone, MapPin, Clock, Send } from 'lucide-react';
import { getCategories } from '@/lib/api';

interface SubCategory { id: number; name: string; slug: string; }
interface Category { id: number; name: string; slug: string; subcategories: SubCategory[]; }

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  return (
    <footer className="bg-white border-t border-gray-100 mt-8">
      {/* Catalog section */}
      {categories.length > 0 && (
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <h3 className="text-base font-bold text-gray-800 mb-6">Каталог товаров</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-6">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <Link
                    href={`/catalog?category=${cat.slug}`}
                    className="block text-sm font-semibold text-gray-800 hover:text-blue-700 mb-2 transition-colors"
                  >
                    {cat.name}
                  </Link>
                  <ul className="space-y-1">
                    {cat.subcategories.slice(0, 6).map((sub) => (
                      <li key={sub.id}>
                        <Link
                          href={`/catalog?category=${sub.slug}`}
                          className="text-xs text-gray-500 hover:text-blue-600 transition-colors leading-relaxed"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom info */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #003d8f, #0077e6)' }}
            >
              T
            </div>
            <span className="font-bold text-gray-800" style={{ color: '#0057B8' }}>TECHNICS</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Интернет-магазин электроники и оборудования безопасности в Бишкеке
          </p>
          <a
            href="https://t.me/"
            className="inline-flex items-center gap-2 mt-4 w-9 h-9 bg-gray-100 hover:bg-blue-100 rounded-lg justify-center transition-colors"
          >
            <Send size={15} className="text-gray-500" />
          </a>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-3 text-sm">Покупателям</h4>
          <ul className="space-y-2">
            {['Доставка и оплата', 'Гарантия', 'Возврат товара', 'Кредит'].map((item) => (
              <li key={item}>
                <a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-3 text-sm">О компании</h4>
          <ul className="space-y-2">
            {['О нас', 'Новости', 'Вакансии', 'Контакты'].map((item) => (
              <li key={item}>
                <a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-3 text-sm">Контакты</h4>
          <ul className="space-y-2.5">
            <li className="flex items-center gap-2">
              <Phone size={13} className="text-blue-500 flex-shrink-0" />
              <a href="tel:+996700916121" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">+996 700 916 121</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-gray-500">г. Бишкек, ул. Киевская 144</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock size={13} className="text-blue-500 flex-shrink-0" />
              <span className="text-xs text-gray-500">Пн–Вс: 9:00–20:00</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © 2026 TECHNICS. Все права защищены.
      </div>
    </footer>
  );
}
