"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useFavoritesStore } from "@/store/favorites";
import { getFavorites } from "@/lib/api";
import { ProductCard, ProductCardSkeleton } from "@/components/product/product-card";
import type { Product } from "@/types";

export default function FavoritesPage() {
  const { user } = useAuthStore();
  const { ids, setIds } = useFavoritesStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getFavorites()
      .then((data) => {
        setProducts(data);
        setIds(data.map((p: Product) => p.id));
        setLoading(false);
      })
      .catch(() => { setIds([]); setLoading(false); });
  }, [user]);

  // Un-hearting a card on this page updates the global favorites store
  // immediately — filter by it so the card disappears right away instead
  // of sitting there looking unremoved (which invited a second click that
  // just re-added it).
  const visibleProducts = products.filter((p) => ids.includes(p.id));

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <Heart className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
        <h1 className="text-xl font-bold mb-3">Войдите чтобы видеть избранное</h1>
        <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">
          Войти <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Heart className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-extrabold">Избранное</h1>
        {!loading && <span className="text-sm text-muted-foreground">({visibleProducts.length} товаров)</span>}
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Heart className="h-16 w-16 text-muted-foreground/20" />
          <h2 className="text-lg font-semibold">Нет избранных товаров</h2>
          <p className="text-sm text-muted-foreground">Нажмите ♡ на карточке товара чтобы добавить в избранное</p>
          <Link href="/catalog" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">
            Перейти в каталог <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visibleProducts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
