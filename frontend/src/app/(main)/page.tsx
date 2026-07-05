"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Truck, Headphones, Award, ChevronLeft, ChevronRight, Wifi, Camera, Tag } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product/product-card";
import { getProducts, getCategories, getBanners } from "@/lib/api";
import type { Product, Category, Banner } from "@/types";

/* ── helpers ── */
function parseImages(raw: string): string[] {
  if (!raw) return [];
  const t = raw.trimStart();
  if (t.startsWith("[")) {
    try { return (JSON.parse(t) as string[]).filter(Boolean); } catch {}
  }
  return [raw];
}

type OverlayConfig = { containerBg: string; imgOpacity: number; gradient: string };

function getOverlay(style?: string): OverlayConfig {
  switch (style) {
    case "none":
      return { containerBg: "#000", imgOpacity: 1, gradient: "" };
    case "dark":
      return { containerBg: "#000", imgOpacity: 1, gradient: "linear-gradient(to right,rgba(0,0,0,0.6),rgba(0,0,0,0.2),transparent)" };
    case "dark-dim":
      return { containerBg: "#000", imgOpacity: 0.5, gradient: "linear-gradient(to right,rgba(0,0,0,0.85),rgba(0,0,0,0.4))" };
    case "blue":
      return { containerBg: "hsl(221,100%,28%)", imgOpacity: 0.5, gradient: "linear-gradient(to right,hsl(221deg 100% 28%/.9),transparent)" };
    default:
      return { containerBg: "#000", imgOpacity: 1, gradient: "" };
  }
}

/* ── Hero Slider ── */
function HeroSlider({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);

  // Reset sub-image when banner changes
  useEffect(() => { setImgIdx(0); }, [idx]);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) {
    return (
      <div className="relative flex h-[300px] items-center overflow-hidden rounded-2xl bg-primary sm:h-[400px] lg:h-[480px]">
        <div className="relative z-10 max-w-2xl px-8 sm:px-12">
          <div className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white">
            Системы безопасности
          </div>
          <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
            Видеонаблюдение<br />и IP-камеры
          </h1>
          <p className="mt-4 text-white/80 sm:text-lg">
            846 товаров от ведущих производителей. Установка под ключ.
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary transition-transform hover:scale-105"
          >
            Перейти в каталог <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 75% 50%, white 0%, transparent 60%)" }} />
      </div>
    );
  }

  const b = banners[idx];
  const imgs = parseImages(b.image);
  const currentImg = imgs[Math.min(imgIdx, imgs.length - 1)] ?? "";
  const overlay = getOverlay(b.overlayStyle);

  return (
    <div className="relative h-[300px] overflow-hidden rounded-2xl sm:h-[400px] lg:h-[480px]"
      style={{ background: overlay.containerBg }}>
      {currentImg && (
        <Image src={currentImg} alt={b.title} fill className="object-cover transition-opacity duration-300"
          style={{ opacity: overlay.imgOpacity }} unoptimized />
      )}
      {overlay.gradient && (
        <div className="absolute inset-0" style={{ background: overlay.gradient }} />
      )}
      <div className="relative z-10 flex h-full max-w-2xl flex-col justify-center px-8 sm:px-12">
        <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">{b.title}</h2>
        {b.subtitle && <p className="mt-4 text-white/80 sm:text-lg">{b.subtitle}</p>}
        {b.buttonText && b.buttonUrl && (
          <Link href={b.buttonUrl} className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary hover:scale-105 transition-transform">
            {b.buttonText} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Thumbnails strip — visible only when this banner has multiple images */}
      {imgs.length > 1 && (
        <div className="absolute bottom-4 right-14 z-20 flex gap-1.5">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setImgIdx(i)}
              className={`relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === imgIdx ? "border-white shadow-lg scale-105" : "border-white/30 opacity-50 hover:opacity-90"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}

      {banners.length > 1 && (
        <>
          <button onClick={() => setIdx((i) => (i - 1 + banners.length) % banners.length)}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => setIdx((i) => (i + 1) % banners.length)}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Advantages ── */
const ADVANTAGES = [
  { icon: Shield, title: "Гарантия качества", desc: "Официальные поставщики" },
  { icon: Truck, title: "Быстрая доставка", desc: "По Бишкеку и регионам" },
  { icon: Headphones, title: "Поддержка 24/7", desc: "Консультация специалиста" },
  { icon: Award, title: "Монтаж под ключ", desc: "Профессиональная установка" },
];

/* ── Categories Grid ── */
function CategoriesSection({ categories }: { categories: Category[] }) {
  const featured = categories.filter((c) => c.featured).slice(0, 8);
  if (!featured.length) return null;
  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-extrabold sm:text-2xl">Категории</h2>
        <Link href="/catalog" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Все <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 min-[450px]:grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {featured.map((cat) => (
          <Link
            key={cat.id}
            href={`/catalog?category=${cat.slug}`}
            className="flex flex-col items-center gap-2 rounded-xl border bg-white p-3 text-center transition-all hover:border-primary/40 hover:shadow-sm"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="text-xl">📷</span>
            </div>
            <span className="text-xs font-medium leading-tight text-foreground line-clamp-2">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── Promo Section (preview) ── */
const PROMO_ITEMS = [
  {
    gradient: "linear-gradient(135deg,#0057B8,#0077e6)",
    icon: "wifi",
    label: "АКЦИЯ",
    title: "Wi-Fi камеры EZVIZ",
    subtitle: "Без прокладки кабеля · с установкой",
    imgs: [
      "https://emin.kg/files/9b29d4867b37401aae450b8c46fbb829",
      "https://emin.kg/files/9108eb5fc94d46f99b18d5f79aed7f2e",
      "https://emin.kg/files/1153f9859209440296d7b7c12a59aa33",
      "",
    ],
    price: "от 2 350 сом",
  },
  {
    gradient: "linear-gradient(135deg,#003d8f,#0057B8)",
    icon: "camera",
    label: "АКЦИЯ",
    title: "Видеонаблюдение под ключ",
    subtitle: "4МР · TVT · NVR + PoE · 4 камеры",
    imgs: [
      "",
      "",
    ],
    price: "от 21 900 сом",
  },
];

function PromoSection() {
  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-extrabold sm:text-2xl">Акции</h2>
        </div>
        <Link href="/aktsii" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Все акции <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PROMO_ITEMS.map((item) => (
          <Link key={item.title} href="/aktsii"
            className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md"
            style={{ borderColor: "hsl(var(--border))" }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: item.gradient }}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                {item.icon === "wifi"
                  ? <Wifi className="h-5 w-5 text-white" />
                  : <Camera className="h-5 w-5 text-white" />}
              </div>
              <div>
                <span className="mb-0.5 inline-block rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                  {item.label}
                </span>
                <p className="text-sm font-bold leading-tight text-white">{item.title}</p>
                <p className="text-[11px] text-white/70">{item.subtitle}</p>
              </div>
            </div>
            {/* Images row */}
            <div className="flex gap-2 px-4 py-3">
              {item.imgs.map((src, i) => (
                <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl bg-secondary shrink-0 flex items-center justify-center">
                  {src
                    ? <Image src={src} alt="" fill className="object-contain p-1" unoptimized />
                    : <Camera className="h-7 w-7 text-muted-foreground/30" />}
                </div>
              ))}
            </div>
            {/* Price */}
            <div className="flex items-center justify-between border-t px-4 py-3" style={{ borderColor: "hsl(var(--border))" }}>
              <span className="text-sm font-black text-primary">{item.price}</span>
              <span className="flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                Подробнее <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── Product Slider ── */
const CARD_W = 220;
const GAP = 16;

function ProductSection({ title, products, loading, startDelay = 0 }: { title: string; products: Product[]; loading?: boolean; startDelay?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(5);

  // считаем сколько целых карточек помещается в контейнер
  useEffect(() => {
    const update = () => {
      if (!wrapRef.current) return;
      const w = wrapRef.current.offsetWidth;
      setVisible(Math.max(1, Math.floor((w + GAP) / (CARD_W + GAP))));
    };
    update();
    const ro = new ResizeObserver(update);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const total = loading ? 0 : products.length;
  const maxIdx = Math.max(0, total - visible);

  const goTo = (i: number) => setIdx(Math.max(0, Math.min(i, maxIdx)));

  // авто-прокрутка каждые 3 секунды, со своим стартовым сдвигом
  useEffect(() => {
    if (loading || total < 2) return;
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setIdx((prev) => (prev >= maxIdx ? 0 : prev + 1));
      }, 3000);
    }, startDelay);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [loading, total, maxIdx, startDelay]);

  const offset = idx * (CARD_W + GAP);

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-extrabold sm:text-2xl">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(idx - 1)}
            disabled={idx === 0}
            className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-secondary disabled:opacity-30"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => goTo(idx + 1)}
            disabled={idx >= maxIdx}
            className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-secondary disabled:opacity-30"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <Link href="/catalog" className="ml-1 flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Все <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* overflow:hidden обрезает по границе, transform двигает точно на CARD_W+GAP */}
      <div ref={wrapRef} className="overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-500 ease-in-out pb-2"
          style={{ transform: `translateX(-${offset}px)` }}
        >
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-[220px] shrink-0"><ProductCardSkeleton /></div>
              ))
            : products.map((p) => (
                <div key={p.id} className="w-[220px] shrink-0">
                  <ProductCard product={p} />
                </div>
              ))
          }
        </div>
      </div>
    </section>
  );
}

/* ── Home Page ── */
export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hits, setHits] = useState<Product[]>([]);
  const [newProds, setNewProds] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBanners().then(setBanners).catch(() => {});
    getCategories().then(setCategories).catch(() => {});
    Promise.all([
      getProducts({ isHit: 'true', limit: 10 }),
      getProducts({ isNew: 'true', limit: 10 }),
    ]).then(([h, n]) => {
      setHits(h?.items ?? h ?? []);
      setNewProds(n?.items ?? n ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-6">
      <HeroSlider banners={banners} />

      <section className="grid grid-cols-1 min-[450px]:grid-cols-2 gap-3 lg:grid-cols-4">
        {ADVANTAGES.map((a) => (
          <div key={a.title} className="flex items-center gap-3 rounded-xl border bg-white p-3.5" style={{ borderColor: "hsl(var(--border))" }}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <a.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold">{a.title}</div>
              <div className="text-xs text-muted-foreground">{a.desc}</div>
            </div>
          </div>
        ))}
      </section>

      <CategoriesSection categories={categories} />

      <PromoSection />

      <ProductSection title="Хиты продаж" products={hits} loading={loading} startDelay={0} />

      <ProductSection title="Новинки" products={newProds} loading={loading} startDelay={1500} />
    </div>
  );
}
