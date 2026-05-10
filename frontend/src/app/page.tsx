'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Zap, Shield, Truck, Headphones } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import CatalogSidebar from '@/components/CatalogSidebar';
import { getFeatured, getProducts } from '@/lib/api';

const BANNERS = [
  {
    title: 'Видеонаблюдение',
    subtitle: 'Hikvision · Dahua · EMIN',
    desc: 'Камеры, регистраторы и готовые комплекты для любых объектов',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1a2f5e 100%)',
    overlay: 'linear-gradient(105deg, rgba(5,5,30,0.72) 0%, rgba(20,40,90,0.42) 45%, rgba(15,30,70,0.10) 100%)',
    accent: '#0057B8',
    href: '/catalog?category=videokamery',
    img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1400&q=80',
  },
  {
    title: 'Ноутбуки и ПК',
    subtitle: 'ASUS · Lenovo · HP · Dell',
    desc: 'Лучшие цены на технику в Бишкеке. Гарантия производителя.',
    bg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #0057B8 100%)',
    overlay: 'linear-gradient(105deg, rgba(10,5,35,0.70) 0%, rgba(40,25,100,0.40) 45%, rgba(30,20,80,0.10) 100%)',
    accent: '#1a7fff',
    href: '/catalog?category=noutbuki-monobloki',
    img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400&q=80',
  },
  {
    title: 'Сигнализация и охрана',
    subtitle: 'Умный дом · GSM · Датчики',
    desc: 'Полный спектр охранных систем и оборудования для безопасности',
    bg: 'linear-gradient(135deg, #0a1628 0%, #162040 50%, #1a2a50 100%)',
    overlay: 'linear-gradient(105deg, rgba(5,10,25,0.72) 0%, rgba(15,30,70,0.42) 45%, rgba(10,25,60,0.10) 100%)',
    accent: '#0066cc',
    href: '/catalog?category=signalizatsiya-i-po',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
  },
];

const ADVANTAGES = [
  { icon: Truck,      title: 'Быстрая доставка', desc: 'По всему Бишкеку за 1–2 дня' },
  { icon: Shield,     title: 'Гарантия',          desc: 'Официальная на все товары' },
  { icon: Zap,        title: 'Лучшие цены',       desc: 'Честные цены без наценок' },
  { icon: Headphones, title: 'Поддержка 24/7',    desc: 'Всегда на связи в WhatsApp' },
];

export default function HomePage() {
  const [popular, setPopular] = useState<any[]>([]);
  const [newItems, setNewItems] = useState<any[]>([]);
  const [slide, setSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getFeatured().then(setPopular).catch(() => {});
    getProducts({ page: 1 }).then((r: any) => setNewItems(r.items ?? [])).catch(() => {});
    const timer = setInterval(() => setSlide((s) => (s + 1) % BANNERS.length), 3000);
    return () => clearInterval(timer);
  }, []);

  // Auto-advance popular carousel every 3 seconds
  useEffect(() => {
    if (popular.length === 0) return;
    const timer = setInterval(() => {
      const el = carouselRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 220, behavior: 'smooth' });
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [popular]);

  const scrollCarousel = (dir: 'prev' | 'next') => {
    carouselRef.current?.scrollBy({ left: dir === 'next' ? 260 : -260, behavior: 'smooth' });
  };

  const banner = BANNERS[slide];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero: sidebar + banner */}
      <section className="max-w-7xl mx-auto px-4 pt-4 pb-3">
        <div className="flex gap-0 items-stretch min-h-[295px]">
          <CatalogSidebar />

          {/* Banner slider */}
          <div
            className="flex-1 relative overflow-hidden"
            style={{ background: banner.bg }}
          >
            {/* Real background image */}
            <img
              key={banner.img}
              src={banner.img}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.88 }}
            />
            {/* Gradient overlay — keeps text readable */}
            <div className="absolute inset-0" style={{ background: banner.overlay }} />
            {/* Decorative accent circle */}
            <div className="absolute -right-10 top-0 w-64 h-64 rounded-full opacity-[0.07]" style={{ background: banner.accent }} />

            <div className="relative z-10 flex flex-col justify-center h-full px-12 py-10">
              <span
                className="inline-block text-xs font-semibold px-3 py-1.5 rounded mb-4 w-fit text-white tracking-wider uppercase"
                style={{ background: banner.accent }}
              >
                {banner.subtitle}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
                {banner.title}
              </h1>
              <p className="text-blue-200/80 text-sm mb-8 max-w-md leading-relaxed">
                {banner.desc}
              </p>
              <Link
                href={banner.href}
                className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-lg transition-all w-fit hover:opacity-90 hover:gap-3 text-sm"
                style={{ background: banner.accent }}
              >
                Смотреть товары <ChevronRight size={16} />
              </Link>
            </div>

            <button
              onClick={() => setSlide((s) => (s - 1 + BANNERS.length) % BANNERS.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setSlide((s) => (s + 1) % BANNERS.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronRight size={16} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {BANNERS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? 'w-6 bg-white' : 'w-1.5 bg-white/35'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Advantages bar */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          {ADVANTAGES.map((adv) => (
            <div key={adv.title} className="flex items-center gap-3 px-5 py-2">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #003d8f, #0077e6)' }}
              >
                <adv.icon size={17} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">{adv.title}</p>
                <p className="text-xs text-gray-400">{adv.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Популярное сейчас — carousel */}
      {popular.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
              <span
                className="w-1 h-5 rounded-full inline-block"
                style={{ background: 'linear-gradient(to bottom, #003d8f, #0077e6)' }}
              />
              Популярное сейчас
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => scrollCarousel('prev')}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all text-white shadow hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #003d8f, #0077e6)' }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollCarousel('next')}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all text-white shadow hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #003d8f, #0077e6)' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div
            ref={carouselRef}
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {popular.map((p) => (
              <div key={p.id} className="w-[200px] flex-shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Новинки — grid */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
            <span
              className="w-1 h-5 rounded-full inline-block"
              style={{ background: 'linear-gradient(to bottom, #003d8f, #0077e6)' }}
            />
            Новинки
          </h2>
          <Link
            href="/catalog"
            className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: '#0057B8' }}
          >
            Все товары <ChevronRight size={14} />
          </Link>
        </div>

        {newItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {newItems.slice(0, 10).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white">
            <p className="text-sm">Товары пока не добавлены</p>
          </div>
        )}
      </section>
    </div>
  );
}
