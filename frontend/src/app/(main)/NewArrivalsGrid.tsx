"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product/product-card";
import { Pagination } from "@/components/common/pagination";
import { getProducts } from "@/lib/api";
import type { Product } from "@/types";

const PAGE_SIZE = 10;

export default function NewArrivalsGrid({ initialProducts, initialTotal }: { initialProducts: Product[]; initialTotal: number }) {
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const goTo = async (p: number) => {
    const target = Math.max(1, Math.min(p, totalPages));
    if (target === page) return;
    setPage(target);
    setLoading(true);
    const res = await getProducts({ isNew: "true", page: target, limit: PAGE_SIZE }).catch(() => null);
    setProducts(res?.items ?? []);
    setTotal(res?.total ?? total);
    setLoading(false);
    window.scrollTo({ top: document.getElementById("new-arrivals")?.offsetTop ?? 0, behavior: "smooth" });
  };

  return (
    <section id="new-arrivals">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-extrabold sm:text-2xl">Новинки</h2>
        <Link href="/catalog" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Все новинки <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((p) => <ProductCard key={p.id} product={p} />)
        }
      </div>

      <Pagination current={page} total={totalPages} onChange={goTo} />
    </section>
  );
}
