import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";
import type { Product } from "@/types";
import ProductView from "./ProductView";

export const revalidate = 300;

async function fetchProduct(slug: string): Promise<Product | null> {
  return getProduct(slug).catch(() => null);
}

function metaDescription(product: Product): string {
  if (product.shortDescription) return product.shortDescription.slice(0, 160);
  if (product.description) return product.description.slice(0, 160);
  const brand = product.brand?.name ? `${product.brand.name} ` : "";
  const category = product.category?.name ? ` в категории «${product.category.name}»` : "";
  return `${brand}${product.name}${category} — купить в Бишкеке с доставкой по Кыргызстану. Гарантия, консультация специалиста.`;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: "Товар не найден" };

  const title = product.seoTitle || `${product.name} — купить в Бишкеке | ${SITE_NAME}`;
  const description = product.seoDescription || metaDescription(product);
  const url = absoluteUrl(`/product/${product.slug}`);
  const image = product.images?.[0]?.url;

  return {
    title,
    description,
    keywords: product.seoKeywords || undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: image ? [{ url: image }] : undefined,
      type: "website",
      locale: "ru_RU",
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) notFound();

  const price = Number(product.price);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: metaDescription(product),
    image: (product.images ?? []).map((i) => i.url),
    sku: product.sku || undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    aggregateRating: product.reviewCount > 0
      ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount }
      : undefined,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: "KGS",
      price,
      availability: product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductView product={product} />
    </>
  );
}
