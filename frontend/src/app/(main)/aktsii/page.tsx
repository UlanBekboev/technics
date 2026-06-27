'use client';
import { Phone, CheckCircle, ShoppingCart, Tag, Wifi, Camera } from 'lucide-react';

const TVT_PACKAGES = [
  { label: 'Комплект с HDD 500 ГБ', note: 'Запись до 5 дней',   price: 21900 },
  { label: 'Комплект с HDD 1 ТБ',   note: 'Запись до 1 недели', price: 24900 },
];

const TVT_FEATURES = [
  '2 внутренние и 2 наружные (морозостойкие и влагозащищённые)',
  'С подсветкой и со звуком',
  'NVR 4-канальный с POE — удобное подключение',
  'Кабель 50 метров в комплекте',
  'Полный комплект аксессуаров',
  'Установка и настройка под ключ',
];

const EZVIZ_ITEMS = [
  {
    name: 'EZVIZ H6c Pro 2K',
    type: 'Кубическая 3МР',
    price: 5790,
    img: 'https://www.ezvizlife.com/content/dam/ezviz/global-website/2022/H6c-Pro/product/H6c-Pro-2K-product-image.png',
  },
  {
    name: 'EZVIZ H1c',
    type: 'Кубическая 2МР',
    price: 5390,
    img: 'https://www.ezvizlife.com/content/dam/ezviz/global-website/2022/H1c/product/H1c-product-image.png',
  },
  {
    name: 'EZVIZ C8W Pro 2K',
    type: 'Уличная Wi-Fi камера',
    price: 6490,
    img: 'https://www.ezvizlife.com/content/dam/ezviz/global-website/2022/C8W-Pro-2K/product/C8W-Pro-2K-product-image.png',
  },
  {
    name: 'OLAX CPE MT-30',
    type: 'Сим-карта роутер 4G',
    price: 2700,
    img: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=300&q=80',
  },
];

const ITEM_FEATURES = ['Флеш карта 64ГБ', '10 дней записи', 'Установка + расход материалы', 'Гарантия 1 год'];

function CallButtons({ gradient }: { gradient: string }) {
  return (
    <div className="flex gap-2 w-full sm:w-auto">
      <a href="tel:+996704443333"
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
        style={{ background: gradient }}>
        <Phone size={14} /> Позвонить
      </a>
      <a href="https://wa.me/996704443333" target="_blank" rel="noopener noreferrer"
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors">
        <ShoppingCart size={14} /> WhatsApp
      </a>
    </div>
  );
}

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

          {/* ══ Акция 1: Видеонаблюдение под ключ ══ */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">

            {/* Шапка */}
            <div className="px-6 py-5 flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Camera size={24} className="text-white" />
              </div>
              <div>
                <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-red-500 text-white px-2 py-0.5 rounded-full mb-1">
                  АКЦИЯ
                </span>
                <h2 className="text-lg font-bold text-white leading-tight">Видеонаблюдение под ключ</h2>
                <p className="text-white/70 text-xs">4МР качество изображения · TVT</p>
              </div>
            </div>

            {/* Фото камер TVT 9440 и 9540 */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 bg-gray-50" style={{ height: 200 }}>
              {[
                { model: 'TVT 9440', src: 'https://tvt.net/wp-content/uploads/TD-9440E3-4MP.png' },
                { model: 'TVT 9540', src: 'https://tvt.net/wp-content/uploads/TD-9540E3-5MP.png' },
              ].map(cam => (
                <div key={cam.model} className="flex flex-col items-center justify-center p-4 gap-2">
                  <img
                    src={cam.src}
                    alt={cam.model}
                    className="flex-1 w-full object-contain"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="text-xs font-bold text-gray-500 tracking-wide">{cam.model}</span>
                </div>
              ))}
            </div>

            <div className="p-6">
              {/* Пакеты */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {TVT_PACKAGES.map(pkg => (
                  <div key={pkg.label} className="rounded-2xl p-5 text-white text-center"
                    style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}>
                    <p className="font-bold text-sm mb-1">{pkg.label}</p>
                    <p className="text-white/70 text-xs mb-3">{pkg.note}</p>
                    <p className="text-4xl font-black">{pkg.price.toLocaleString()}</p>
                    <p className="text-white/80 text-sm">сом</p>
                  </div>
                ))}
              </div>

              {/* Характеристики */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                {TVT_FEATURES.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              {/* Теги */}
              <div className="flex flex-wrap gap-2 mb-5">
                {['Надёжно и безопасно', 'Профессиональная установка', 'Гарантия качества'].map(a => (
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
                  <p className="text-xs font-semibold text-gray-700">2 ГОДА гарантии на камеры и работы</p>
                </div>
                <CallButtons gradient="linear-gradient(135deg,#003d8f,#0077e6)" />
              </div>
            </div>
          </div>

          {/* ══ Акция 2: Wi-Fi камеры EZVIZ ══ */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">

            {/* Шапка */}
            <div className="px-6 py-5 flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg,#0057B8,#0099ff)' }}>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Wifi size={24} className="text-white" />
              </div>
              <div>
                <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-red-500 text-white px-2 py-0.5 rounded-full mb-1">
                  АКЦИЯ
                </span>
                <h2 className="text-lg font-bold text-white leading-tight">Wi-Fi камеры EZVIZ</h2>
                <p className="text-white/70 text-xs">С установкой и записью</p>
              </div>
            </div>

            <div className="p-6">
              {/* Карточки камер */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {EZVIZ_ITEMS.map(item => (
                  <div key={item.name} className="border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-sm transition-all">
                    {/* Фото */}
                    <div className="bg-gray-50 flex items-center justify-center" style={{ height: 130 }}>
                      <img
                        src={item.img}
                        alt={item.name}
                        className="h-full w-full object-contain p-3"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                    {/* Инфо */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.type}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-400 uppercase tracking-wide">Цена</p>
                          <p className="text-xl font-black" style={{ color: '#0057B8' }}>{item.price.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">сом</p>
                        </div>
                      </div>
                      <ul className="space-y-1">
                        {ITEM_FEATURES.map(f => (
                          <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                            <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Теги */}
              <div className="flex flex-wrap gap-2 mb-5">
                {['Надёжное оборудование', 'Установка под ключ', 'Поддержка и консультация'].map(a => (
                  <span key={a} className="text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100 text-blue-700 bg-blue-50">
                    {a}
                  </span>
                ))}
              </div>

              {/* Гарантия + CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#0057B8,#0099ff)' }}>
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700">1 ГОД гарантии на камеры и работы</p>
                </div>
                <CallButtons gradient="linear-gradient(135deg,#0057B8,#0099ff)" />
              </div>
            </div>
          </div>

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
