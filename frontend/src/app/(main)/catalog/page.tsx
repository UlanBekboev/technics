import { Suspense } from 'react';
import type { Metadata } from 'next';
import CatalogContent from './CatalogContent';
import { getCategoriesFlat } from '@/lib/api';
import { absoluteUrl, SITE_NAME } from '@/lib/seo';

type SearchParams = Promise<{ category?: string; search?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { category: categorySlug, search } = await searchParams;

  if (search) {
    return {
      title: `Поиск: «${search}» | ${SITE_NAME}`,
      robots: { index: false, follow: true },
    };
  }

  if (categorySlug) {
    const categories = await getCategoriesFlat().catch(() => []);
    const category = categories.find((c: { slug: string }) => c.slug === categorySlug);
    if (category) {
      const title = `Купить ${category.name.toLowerCase()} в Бишкеке | ${SITE_NAME}`;
      const description = `${category.name} — широкий выбор, актуальные цены, доставка по Бишкеку и Кыргызстану. ${category.productCount ?? ''} товаров в наличии.`;
      const url = absoluteUrl(`/catalog?category=${category.slug}`);
      return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: { title, description, url, siteName: SITE_NAME, type: 'website', locale: 'ru_RU' },
      };
    }
  }

  const title = `Каталог товаров | ${SITE_NAME}`;
  const description = 'Полный каталог систем видеонаблюдения, сигнализаций, домофонии, компьютерной техники и аксессуаров в Бишкеке.';
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl('/catalog') },
    openGraph: { title, description, url: absoluteUrl('/catalog'), siteName: SITE_NAME, type: 'website', locale: 'ru_RU' },
  };
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 animate-pulse"><div className="h-8 bg-gray-100 rounded w-48 mb-6" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({length:12}).map((_,i)=><div key={i} className="bg-white rounded-2xl border aspect-[3/4]"/>)}</div></div>}>
      <CatalogContent />
    </Suspense>
  );
}
