"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { useFavoritesStore } from "@/store/favorites";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toast";
import { addToCart as apiAddToCart, toggleFavorite as apiToggleFavorite } from "@/lib/api";
import type { Product } from "@/types";

function discountPercent(price: number, oldPrice?: number | null) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function ProductCard({ product }: { product: Product }) {
  const favs = useFavoritesStore();
  const cart = useCartStore();
  const { show } = useToastStore();
  const [mounted, setMounted] = useState(false);
  const [adding, setAdding] = useState(false);
  useEffect(() => setMounted(true), []);

  const isFav = mounted && favs.has(product.id);
  const percent = discountPercent(Number(product.price), Number(product.oldPrice));
  const mainImage = product.images?.find((i) => i.isMain)?.url ?? product.images?.[0]?.url;
  const brandName = product.brand?.name ?? "";

  const handleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    favs.toggle(product.id);
    try { await apiToggleFavorite(product.id); } catch {}
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (adding) return;
    setAdding(true);
    const localItem = {
      id: Date.now(),
      quantity: 1,
      productId: product.id,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        images: product.images ?? [],
      },
    };
    try {
      const result = await apiAddToCart(product.id, 1);
      cart.addItem(result ?? localItem);
    } catch {
      cart.addItem(localItem);
    }
    show("Товар добавлен в корзину");
    setAdding(false);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md"
      style={{ borderColor: "hsl(var(--border))" }}
    >
      {/* Accent bar */}
      <span className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />

      {/* Badges */}
      <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1">
        {percent > 0 && (
          <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
            −{percent}%
          </span>
        )}
        {product.isNew && (
          <span className="rounded-md bg-success px-2 py-0.5 text-[11px] font-semibold text-success-foreground">
            Новинка
          </span>
        )}
        {product.isHit && !product.isNew && (
          <span className="rounded-md bg-warning px-2 py-0.5 text-[11px] font-semibold text-warning-foreground">
            Хит
          </span>
        )}
      </div>

      {/* Favorite */}
      <button
        onClick={handleFav}
        aria-label={isFav ? "Убрать из избранного" : "В избранное"}
        className={cn(
          "absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-white/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-primary",
          isFav && "border-primary/40 text-primary",
        )}
        style={{ borderColor: isFav ? undefined : "hsl(var(--border))" }}
      >
        <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
      </button>

      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block overflow-hidden bg-secondary/30" tabIndex={-1}>
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            width={400}
            height={400}
            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized={mainImage.startsWith("http")}
          />
        ) : (
          <div className="aspect-square w-full flex items-center justify-center bg-secondary/50">
            <Camera className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3.5">
        {brandName && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            {brandName}
          </span>
        )}

        <Link
          href={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold tabular-nums text-foreground">
              {formatPrice(Number(product.price))}
            </span>
            {percent > 0 && product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through tabular-nums">
                {formatPrice(Number(product.oldPrice))}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs">
            {product.stock > 0 ? (
              <>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
                <span className="text-success">В наличии</span>
              </>
            ) : (
              <>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                <span className="text-muted-foreground">Нет в наличии</span>
              </>
            )}
          </div>

          {product.stock === 0 ? (
            <div className="mt-3 flex w-full items-center justify-center rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white">
              Нет в наличии
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              {adding ? "Добавляем..." : "В корзину"}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "hsl(var(--border))" }}>
      <div className="aspect-square w-full shimmer bg-secondary/50" />
      <div className="flex flex-col p-3.5 gap-2">
        <div className="h-3 w-16 rounded shimmer bg-secondary" />
        <div className="h-4 w-full rounded shimmer bg-secondary" />
        <div className="h-4 w-3/4 rounded shimmer bg-secondary" />
        <div className="mt-2 h-6 w-24 rounded shimmer bg-secondary" />
        <div className="h-9 w-full rounded-lg shimmer bg-secondary" />
      </div>
    </div>
  );
}
