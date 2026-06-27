'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Zap, Shield, Truck, Headphones } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import RecentlyViewed from '@/components/RecentlyViewed';
import { getFeatured, getProducts } from '@/lib/api';

const BANNERS = [
  {
    title: 'Видеонаблюдение',
    subtitle: 'Hikvision · Dahua · EMIN',
    desc: 'Камеры, регистраторы и готовые комплекты для любых объектов',
    href: '/catalog?category=videokamery',
    img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1400&q=80',
    color: '#0057B8',
  },
  {
    title: 'Ноутбуки и ПК',
    subtitle: 'ASUS · Lenovo · HP · Dell',
    desc: 'Лучшие цены на технику в Бишкеке. Гарантия производителя.',
    href: '/catalog?category=noutbuki-monobloki',
    img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400&q=80',
    color: '#7C3AED',
  },
  {
    title: 'Сигнализация и охрана',
    subtitle: 'Умный дом · GSM · Датчики',
    desc: 'Полный спектр охранных систем и оборудования',
    href: '/catalog?category=signalizatsiya-i-po',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
    color: '#0891B2',
  },
];


const ADVANTAGES = [
  { icon: Truck,      title: 'Быстрая доставка', desc: 'По всему Бишкеку за 1–2 дня' },
  { icon: Shield,     title: 'Официальная гарантия', desc: 'На всё оборудование' },
  { icon: Zap,        title: 'Лучшие цены',      desc: 'Честные цены без наценок' },
  { icon: Headphones, title: 'Поддержка 24/7',   desc: 'Всегда на связи в WhatsApp' },
];

export default function HomePage() {
  const [popular, setPopular]   = useState<any[]>([]);
  const [newItems, setNewItems] = useState<any[]>([]);
  const [slide, setSlide]       = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const slideTimer  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getFeatured().then(setPopular).catch(() => {});
    getProducts({ page: 1 }).then((r: any) => setNewItems(r.items ?? [])).catch(() => {});
  }, []);

  // Auto-advance banner
  useEffect(() => {
    slideTimer.current = setInterval(() => setSlide(s => (s + 1) % BANNERS.length), 4500);
    return () => { if (slideTimer.current) clearInterval(slideTimer.current); };
  }, []);

  const goSlide = (i: number) => {
    setSlide(i);
    if (slideTimer.current) clearInterval(slideTimer.current);
    slideTimer.current = setInterval(() => setSlide(s => (s + 1) % BANNERS.length), 4500);
  };

  const scrollCarousel = (dir: 'prev' | 'next') => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'next' ? 220 : -220, behavior: 'smooth' });
  };

  const banner = BANNERS[slide];

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero Banner ── */}
      <section className="relative w-full overflow-hidden" style={{ height: 'clamp(260px, 42vw, 480px)' }}>
        {BANNERS.map((b, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === slide ? 1 : 0, pointerEvents: i === slide ? 'auto' : 'none' }}
          >
            <img src={b.img} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.3) 55%,transparent 100%)' }} />
          </div>
        ))}

        {/* Text overlay */}
        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-3xl">
          <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 w-fit text-white uppercase tracking-widest"
            style={{ background: banner.color }}>
            {banner.subtitle}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight drop-shadow-lg">
            {banner.title}
          </h1>
          <p className="text-white/70 text-sm md:text-base mb-7 max-w-sm leading-relaxed">
            {banner.desc}
          </p>
          <Link href={banner.href}
            className="inline-flex items-center gap-2 text-white font-bold px-7 py-3 rounded-full text-sm transition-all hover:opacity-90 hover:gap-3 w-fit shadow-lg"
            style={{ background: banner.color }}>
            Смотреть товары <ChevronRight size={16} />
          </Link>
        </div>

        {/* Arrows */}
        <button onClick={() => goSlide((slide - 1 + BANNERS.length) % BANNERS.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => goSlide((slide + 1) % BANNERS.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all">
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => goSlide(i)}
              className={`rounded-full transition-all duration-300 ${i === slide ? 'w-7 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`} />
          ))}
        </div>
      </section>

      {/* ── Advantages ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-gray-100">
          {ADVANTAGES.map(adv => (
            <div key={adv.title} className="flex items-center gap-3 px-5 py-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}>
                <adv.icon size={17} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">{adv.title}</p>
                <p className="text-[11px] text-gray-400">{adv.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ── Popular now ── */}
      {popular.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
              <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'linear-gradient(to bottom,#003d8f,#0077e6)' }} />
              Популярное сейчас
            </h2>
            <div className="flex gap-2">
              <button onClick={() => scrollCarousel('prev')}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scrollCarousel('next')}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div ref={carouselRef} className="flex gap-3 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: 'none' }}>
            {popular.map(p => (
              <div key={p.id} className="w-[200px] flex-shrink-0 snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── New items ── */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'linear-gradient(to bottom,#003d8f,#0077e6)' }} />
            Новинки
          </h2>
          <Link href="/catalog" className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: '#0057B8' }}>
            Все товары <ChevronRight size={14} />
          </Link>
        </div>
        {newItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {newItems.slice(0, 10).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white">
            <p className="text-sm">Товары пока не добавлены</p>
          </div>
        )}
      </section>

      <RecentlyViewed />

      {/* ── Why us ── */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="rounded-3xl p-8 md:p-10" style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-7">Почему выбирают нас</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Truck,      title: 'Быстрая доставка',    desc: 'Доставим по Бишкеку в день заказа и отправим в регионы.' },
              { icon: Shield,     title: 'Гарантия качества',   desc: 'Официальная гарантия производителя на всю продукцию.' },
              { icon: Zap,        title: 'Официальные товары',  desc: 'Только сертифицированная и оригинальная техника.' },
              { icon: Headphones, title: 'Поддержка клиентов',  desc: 'Консультация и помощь 24/7 через WhatsApp и Telegram.' },
            ].map(item => (
              <div key={item.title} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <item.icon size={20} className="text-white" />
                </div>
                <p className="font-bold text-white text-base mb-1.5">{item.title}</p>
                <p className="text-white/75 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
