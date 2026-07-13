"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, Camera } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { updateCartItem, removeFromCart, createOrder } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

export default function CartPage() {
  const { items, updateItem, removeItem, clearCart, total } = useCartStore();
  const { user } = useAuthStore();
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);

  const handleQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) return;
    const prevQuantity = items.find((i) => i.productId === productId)?.quantity;
    updateItem(productId, quantity);
    try {
      await updateCartItem(productId, quantity);
    } catch (err: any) {
      if (prevQuantity !== undefined) updateItem(productId, prevQuantity);
      toast.error(err?.response?.data?.message ?? "Не удалось изменить количество");
    }
  };

  const handleRemove = async (productId: number) => {
    removeItem(productId);
    try { await removeFromCart(productId); } catch {}
  };

  const handleOrder = async () => {
    if (!address.trim()) return;
    setPlacing(true);
    try {
      await createOrder(address, comment);
      clearCart();
      setDone(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Не удалось оформить заказ");
    }
    setPlacing(false);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-2xl font-extrabold mb-3">Заказ оформлен!</h1>
        <p className="text-muted-foreground mb-6">Мы свяжемся с вами для подтверждения.</p>
        <Link href="/catalog" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">
          Продолжить покупки <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
        <h1 className="text-xl font-bold mb-3">Корзина пуста</h1>
        <p className="text-sm text-muted-foreground mb-6">Добавьте товары из каталога</p>
        <Link href="/catalog" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">
          Перейти в каталог <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const subtotal = total();
  const delivery = subtotal >= 50000 ? 0 : 300;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-extrabold">Корзина</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const img = item.product.images?.find((i) => i.isMain)?.url ?? item.product.images?.[0]?.url;
            return (
              <div key={item.productId} className="flex gap-4 rounded-xl border bg-white p-4" style={{ borderColor: "hsl(var(--border))" }}>
                <Link href={`/product/${item.product.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  {img
                    ? <Image src={img} alt={item.product.name} fill className="object-contain p-1" unoptimized />
                    : <Camera className="m-auto h-8 w-8 text-muted-foreground/30" />
                  }
                </Link>

                <div className="flex flex-1 flex-col gap-2">
                  <Link href={`/product/${item.product.slug}`} className="text-sm font-medium hover:text-primary line-clamp-2">
                    {item.product.name}
                  </Link>
                  <span className="text-base font-extrabold">{formatPrice(Number(item.product.price))}</span>

                  <div className="flex items-center gap-3 mt-auto">
                    {/* Quantity */}
                    <div className="flex items-center rounded-lg border" style={{ borderColor: "hsl(var(--border))" }}>
                      <button onClick={() => handleQuantity(item.productId, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center hover:bg-secondary">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => handleQuantity(item.productId, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center hover:bg-secondary">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <span className="text-sm font-semibold text-muted-foreground">
                      {formatPrice(Number(item.product.price) * item.quantity)}
                    </span>

                    <button onClick={() => handleRemove(item.productId)} className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-5 space-y-4 sticky top-24" style={{ borderColor: "hsl(var(--border))" }}>
            <h2 className="font-extrabold text-lg">Итого</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Товары ({items.reduce((s, i) => s + i.quantity, 0)} шт.)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Доставка</span>
                <span>{delivery === 0 ? <span className="text-success">Бесплатно</span> : formatPrice(delivery)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-base" style={{ borderColor: "hsl(var(--border))" }}>
                <span>К оплате</span>
                <span>{formatPrice(subtotal + delivery)}</span>
              </div>
            </div>

            {delivery > 0 && (
              <p className="text-xs text-muted-foreground">Бесплатная доставка от {formatPrice(50000)}</p>
            )}

            {user ? (
              <div className="space-y-3">
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Адрес доставки *"
                  rows={2}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                  style={{ borderColor: "hsl(var(--border))" }}
                />
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Комментарий (необязательно)"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary"
                  style={{ borderColor: "hsl(var(--border))" }}
                />
                <button
                  onClick={handleOrder}
                  disabled={placing || !address.trim()}
                  className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {placing ? "Оформляем..." : "Оформить заказ"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Войдите чтобы оформить заказ</p>
                <Link href="/login" className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground hover:opacity-90">
                  Войти <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
