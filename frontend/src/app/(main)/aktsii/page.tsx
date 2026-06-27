'use client';
import Link from 'next/link';
import { Phone, CheckCircle, ShoppingCart, Tag, Wifi, Camera } from 'lucide-react';

const PROMOS = [
  {
    id: 1,
    badge: 'АКЦИЯ',
    tag: 'Wi-Fi камеры',
    icon: Wifi,
    title: 'Wi-Fi камеры EZVIZ',
    subtitle: 'С установкой и записью',
    color: '#0057B8',
    items: [
      {
        name: 'EZVIZ H6c Pro 2K',
        type: 'Кубическая 3МР',
        features: ['Флеш карта 64ГБ', '10 дней записи', 'Установка + расход материалы', 'Гарантия 1 год'],
        price: 5790,
      },
      {
        name: 'EZVIZ H1c',
        type: 'Кубическая 2МР',
        features: ['Флеш карта 64ГБ', '10 дней записи', 'Установка + расход материалы', 'Гарантия 1 год'],
        price: 5390,
      },
      {
        name: 'EZVIZ C8W Pro 2K',
        type: 'Уличная Wi-Fi камера',
        features: ['Флеш карта 64ГБ', '10 дней записи', 'Установка + расход материалы', 'Гарантия 1 год'],
        price: 6490,
      },
      {
        name: 'OLAX CPE MT-30',
        type: 'Сим-карта роутер 4G',
        features: ['Мобильный интернет', 'Подходит для камер', 'Простая настройка', 'Гарантия 1 год'],
        price: 2700,
      },
    ],
    advantages: ['Надёжное оборудование', 'Установка под ключ', 'Поддержка и консультация'],
    guarantee: '1 ГОД гарантии на камеры и работы',
  },
  {
    id: 2,
    badge: 'АКЦИЯ',
    tag: 'Комплект под ключ',
    icon: Camera,
    title: 'Видеонаблюдение под ключ',
    subtitle: '4МР качество изображения · TVT',
    color: '#003d8f',
    features: [
      '4 камеры морозостойкие и влагозащищённые',
      'С подсветкой и со звуком',
      'NVR 4-канальный с POE — удобное подключение',
      'Кабель 50 метров в комплекте',
      'Полный комплект аксессуаров',
      'Установка и настройка под ключ',
    ],
    packages: [
      { label: 'Комплект с HDD 500 ГБ', note: 'Запись до 5 дней', price: 21900 },
      { label: 'Комплект с HDD 1 ТБ',   note: 'Запись до 1 недели', price: 24900 },
    ],
    advantages: ['Надёжно и безопасно', 'Профессиональная установка', 'Гарантия качества'],
    guarantee: '2 ГОДА гарантии на камеры и работы',
  },
];

export default function AktsiiPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">

        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Tag size={20} style={{ color: '#0057B8' }} />
            <h1 className="text-2xl font-bold text-gray-900">Акции и спецпредложения</h1>
          </div>
          <p className="text-gray-500 text-sm">Выгодные комплекты с установкой под ключ</p>
        </div>

        <div className="flex flex-col gap-8">
          {PROMOS.map(promo => (
            <div key={promo.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">

              {/* Шапка карточки */}
              <div className="px-6 py-5 flex items-center gap-4" style={{ background: `linear-gradient(135deg, ${promo.color}, #0077e6)` }}>
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <promo.icon size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-red-500 text-white px-2 py-0.5 rounded-full mb-1">
                    {promo.badge}
                  </span>
                  <h2 className="text-lg font-bold text-white leading-tight">{promo.title}</h2>
                  <p className="text-white/70 text-xs">{promo.subtitle}</p>
                </div>
              </div>

              <div className="p-6">
                {/* Вариант 1: отдельные товары */}
                {'items' in promo && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {(promo as typeof PROMOS[0]).items.map(item => (
                      <div key={item.name} className="border border-gray-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.type}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Цена</p>
                            <p className="text-xl font-black" style={{ color: '#0057B8' }}>
                              {item.price.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">сом</p>
                          </div>
                        </div>
                        <ul className="space-y-1">
                          {item.features.map(f => (
                            <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                              <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Вариант 2: комплекты */}
                {'packages' in promo && (
                  <div className="mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                      {(promo as typeof PROMOS[1]).packages.map(pkg => (
                        <div key={pkg.label} className="rounded-2xl p-5 text-white text-center"
                          style={{ background: `linear-gradient(135deg, ${promo.color}, #0077e6)` }}>
                          <p className="font-bold text-sm mb-1">{pkg.label}</p>
                          <p className="text-white/70 text-xs mb-3">{pkg.note}</p>
                          <p className="text-4xl font-black">{pkg.price.toLocaleString()}</p>
                          <p className="text-white/80 text-sm">сом</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(promo as typeof PROMOS[1]).features.map(f => (
                        <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Преимущества */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {promo.advantages.map(a => (
                    <span key={a} className="text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100 text-blue-700 bg-blue-50">
                      {a}
                    </span>
                  ))}
                </div>

                {/* Гарантия + CTA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}>
                      <CheckCircle size={16} className="text-white" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700">{promo.guarantee}</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <a href="tel:+996704443333"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}>
                      <Phone size={14} /> Позвонить
                    </a>
                    <a href="https://wa.me/996704443333" target="_blank" rel="noopener noreferrer"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors">
                      <ShoppingCart size={14} /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Контакты снизу */}
        <div className="mt-8 rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}>
          <p className="text-white font-bold text-lg mb-1">Пишите или звоните!</p>
          <p className="text-white/70 text-sm mb-4">С радостью ответим на ваши вопросы</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:+996704443333" className="flex items-center gap-2 text-white font-bold hover:text-amber-300 transition-colors">
              <Phone size={16} /> 0704 44 33 33
            </a>
            <span className="hidden sm:block text-white/30">|</span>
            <a href="tel:+996553413333" className="flex items-center gap-2 text-white font-bold hover:text-amber-300 transition-colors">
              <Phone size={16} /> 0553 41 33 33
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
