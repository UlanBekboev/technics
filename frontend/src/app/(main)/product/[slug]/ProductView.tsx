"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Camera, Star, ChevronRight, Check } from "lucide-react";
import { addToCart as apiAddToCart, toggleFavorite as apiToggleFavorite } from "@/lib/api";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";

function Gallery({ images, name }: { images: { url: string; isMain: boolean }[]; name: string }) {
  const [active, setActive] = useState(0);
  const imgs = images.length > 0 ? images : [];

  if (!imgs.length) {
    return (
      <div className="aspect-square w-full flex items-center justify-center rounded-2xl bg-secondary">
        <Camera className="h-20 w-20 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl border bg-secondary" style={{ borderColor: "hsl(var(--border))" }}>
        <Image src={imgs[active].url} alt={name} fill className="object-contain p-4" unoptimized />
      </div>
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === active ? "border-primary" : "border-transparent"
              )}
              style={i !== active ? { borderColor: "hsl(var(--border))" } : undefined}
            >
              <Image src={img.url} alt={`${name} — фото ${i + 1}`} fill className="object-contain p-1" unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SpecsTab({ specs }: { specs: { key: string; value: string }[] }) {
  if (!specs.length) return <p className="text-sm text-muted-foreground py-4">Характеристики не указаны</p>;

  return (
    <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
      {specs.map((s, i) => (
        <div key={i} className="grid grid-cols-2 gap-4 py-3 text-sm">
          <span className="text-muted-foreground">{s.key}</span>
          <span className="font-medium text-foreground">{s.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProductView({ product }: { product: Product }) {
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");

  const favs = useFavoritesStore();
  const cart = useCartStore();

  const isFav = favs.has(product.id);

  const handleFav = async () => {
    favs.toggle(product.id);
    try { await apiToggleFavorite(product.id); } catch {}
  };

  const handleAddToCart = async () => {
    if (adding) return;
    setAdding(true);
    try {
      const result = await apiAddToCart(product.id, 1);
      cart.addItem({
        id: result?.id ?? Date.now(),
        quantity: 1,
        productId: product.id,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          images: product.images ?? [],
        },
      });
    } catch {}
    setAdding(false);
  };

  const price = Number(product.price);
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;
  const discount = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Главная</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/catalog" className="hover:text-foreground">Каталог</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/catalog?category=${product.category.slug}`} className="hover:text-foreground">{product.category.name}</Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <Gallery images={product.images ?? []} name={product.name} />

        {/* Info */}
        <div className="space-y-5">
          {product.brand && (
            <span className="text-xs font-bold uppercase tracking-widest text-primary">{product.brand.name}</span>
          )}
          <h1 className="text-2xl font-extrabold leading-tight text-foreground">{product.name}</h1>

          {product.sku && (
            <p className="text-xs text-muted-foreground">Артикул: {product.sku}</p>
          )}

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("h-4 w-4", i < Math.round(product.rating) ? "fill-warning text-warning" : "fill-muted text-muted")} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.reviewCount} отзывов)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black tabular-nums">{formatPrice(price)}</span>
            {oldPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through tabular-nums">{formatPrice(oldPrice)}</span>
                {discount > 0 && (
                  <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-sm font-bold text-primary">−{discount}%</span>
                )}
              </>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            {product.stock > 0 ? (
              <>
                <Check className="h-4 w-4 text-success" />
                <span className="text-success font-medium">В наличии</span>
              </>
            ) : (
              <span className="text-muted-foreground">Нет в наличии</span>
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-sm text-muted-foreground leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <ShoppingCart className="h-5 w-5" />
              {adding ? "Добавляем..." : "В корзину"}
            </button>
            <button
              onClick={handleFav}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-colors",
                isFav ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              )}
              aria-label="В избранное"
            >
              <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <div className="flex border-b" style={{ borderColor: "hsl(var(--border))" }}>
          {(["desc", "specs", "reviews"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "desc" ? "Описание" : t === "specs" ? "Характеристики" : "Отзывы"}
            </button>
          ))}
        </div>
        <div className="py-6">
          {tab === "desc" && (
            <div className="prose prose-sm max-w-none">
              {product.description
                ? <p className="text-sm leading-relaxed text-foreground">{product.description}</p>
                : <p className="text-sm text-muted-foreground">Описание отсутствует</p>
              }
            </div>
          )}
          {tab === "specs" && <SpecsTab specs={product.specs ?? []} />}
          {tab === "reviews" && (
            <p className="text-sm text-muted-foreground">
              {product.reviewCount > 0 ? `${product.reviewCount} отзывов` : "Пока нет отзывов. Будьте первым!"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
