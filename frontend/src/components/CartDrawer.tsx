'use client';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { removeFromCart, updateCartItem } from '@/lib/api';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateItem, total, count } = useCartStore();

  const handleRemove = async (productId: number) => {
    try { await removeFromCart(productId); } catch {}
    removeItem(productId);
  };

  const handleUpdate = async (productId: number, quantity: number) => {
    if (quantity < 1) return handleRemove(productId);
    try { await updateCartItem(productId, quantity); } catch {}
    updateItem(productId, quantity);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={closeCart} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag size={20} className="text-blue-600" />
            Корзина <span className="text-gray-400 text-sm font-normal">({count()} товара)</span>
          </h2>
          <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
            <ShoppingBag size={56} strokeWidth={1} />
            <p className="text-lg">Корзина пуста</p>
            <button onClick={closeCart} className="text-blue-600 text-sm hover:underline">Перейти в каталог</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => {
                const img = item.product.images?.find((i) => i.isMain) || item.product.images?.[0];
                return (
                  <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 bg-white rounded-lg flex-shrink-0 overflow-hidden border">
                      {img ? (
                        <img src={img.url} alt={item.product.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.product.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium line-clamp-2 hover:text-blue-600 transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-blue-600 font-bold mt-1">
                        {(Number(item.product.price) * item.quantity).toLocaleString()} сом
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleUpdate(item.productId, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdate(item.productId, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => handleRemove(item.productId)}
                          className="ml-auto p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-gray-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-5 border-t bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Итого:</span>
                <span className="text-xl font-bold text-blue-600">{total().toLocaleString()} сом</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3.5 rounded-xl font-semibold transition-colors"
              >
                Оформить заказ
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
