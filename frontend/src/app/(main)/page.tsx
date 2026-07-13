import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Shield, Truck, Headphones, Award, ArrowRight, icons } from "lucide-react";
import { getProducts, getCategories, getBanners } from "@/lib/api";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";
import type { Product, Category, Banner } from "@/types";
import HeroSlider from "./HeroSlider";
import PromoSection from "./PromoSection";
import ProductSection from "./ProductSection";
import NewArrivalsGrid from "./NewArrivalsGrid";

// Forced dynamic rather than ISR: static prerendering of this route has
// intermittently baked in stale client-chunk hashes at build time (Next
// 16.2.5), breaking the page after deploy until a lucky rebuild. Rendering
// per-request avoids the static-HTML code path entirely.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: `${SITE_NAME} — системы безопасности и цифровая техника в Бишкеке`,
    description: "Интернет-магазин систем видеонаблюдения, IP-камер, регистраторов и цифровой техники в Бишкеке и по Кыргызстану.",
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    type: "website",
    locale: "ru_RU",
  },
};

function parseImages(raw: string): string[] {
  if (!raw) return [];
  const t = raw.trimStart();
  if (t.startsWith("[")) {
    try { return (JSON.parse(t) as string[]).filter(Boolean); } catch {}
  }
  return [raw];
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
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold sm:text-2xl">Категории товаров</h2>
          <p className="mt-1 text-sm text-muted-foreground">Найдите технику по разделам</p>
        </div>
        <Link href="/catalog" className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">
          Смотреть все <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {featured.map((cat) => {
          const img = parseImages(cat.imageUrl ?? "")[0];
          const Icon = icons[cat.icon as keyof typeof icons] ?? icons.Package;
          return (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.slug}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary"
            >
              {img ? (
                <Image
                  src={img}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#0057B8,#003d8f)" }}
                >
                  <Icon className="h-10 w-10 text-white/25" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white backdrop-blur-sm">
                <Icon className="h-4 w-4" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-sm font-bold leading-tight text-white line-clamp-2">{cat.name}</p>
                <p className="mt-0.5 text-xs text-white/70">{cat.productCount ?? 0} товаров</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ── Home Page ── */
export default async function HomePage() {
  const [banners, categories, hitsRes, newRes] = await Promise.all([
    getBanners().catch((): Banner[] => []),
    getCategories().catch((): Category[] => []),
    getProducts({ isHit: "true", limit: 10 }).catch(() => null),
    getProducts({ isNew: "true", limit: 10 }).catch(() => null),
  ]);

  const hits: Product[] = hitsRes?.items ?? hitsRes ?? [];
  const newProds: Product[] = newRes?.items ?? newRes ?? [];
  const newTotal: number = newRes?.total ?? newProds.length;

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

      <ProductSection title="Хиты продаж" products={hits} startDelay={0} />

      <NewArrivalsGrid initialProducts={newProds} initialTotal={newTotal} />
    </div>
  );
}
