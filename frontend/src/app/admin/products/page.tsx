'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { api, getCategories } from '@/lib/api';
import { Plus, Pencil, Trash2, ImagePlus, Star, X, Search, Package } from 'lucide-react';

interface Category { id: number; name: string; slug: string; subcategories: any[]; }
interface ProductImage { id: number; url: string; isMain: boolean; }
interface Product {
  id: number; name: string; slug: string; price: string; oldPrice?: string;
  stock: number; isActive: boolean; categoryId: number;
  category: { name: string }; brand?: { name: string };
  images: ProductImage[];
}

const EMPTY_FORM = {
  name: '', slug: '', description: '', price: '', oldPrice: '',
  stock: '0', categoryId: '', brandId: '', isActive: true,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-').replace(/^-|-$/g, '');
}

export default function AdminProductsPage() {
  const { user } = useAuthStore();
  const router   = useRouter();

  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [editing,    setEditing]    = useState<Product | null>(null);
  const [form,       setForm]       = useState({ ...EMPTY_FORM });
  const [saving,     setSaving]     = useState(false);
  const [imgProduct, setImgProduct] = useState<Product | null>(null);
  const [uploading,  setUploading]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'ADMIN') { router.push('/'); return; }
    loadProducts();
    getCategories().then(cats => {
      // flatten: parent + subcats
      const all: Category[] = [];
      cats.forEach((c: any) => { all.push(c); c.subcategories?.forEach((s: any) => all.push(s)); });
      setCategories(all);
    });
  }, [user]);

  const loadProducts = async (q = search) => {
    setLoading(true);
    try {
      const data = await api.get('/products/admin/list', { params: q ? { search: q } : {} }).then(r => r.data);
      setProducts(data);
    } catch {}
    setLoading(false);
  };

  // ── Form ──────────────────────────────────────
  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM }); };
  const openEdit   = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: '',
      price: p.price, oldPrice: p.oldPrice ?? '',
      stock: String(p.stock), categoryId: String(p.categoryId),
      brandId: '', isActive: p.isActive,
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description || undefined,
        price: +form.price,
        oldPrice: form.oldPrice ? +form.oldPrice : undefined,
        stock: +form.stock,
        categoryId: +form.categoryId,
        brandId: form.brandId ? +form.brandId : undefined,
        isActive: form.isActive,
      };
      if (editing) {
        await api.put(`/products/admin/${editing.id}`, payload);
      } else {
        await api.post('/products/admin', payload);
      }
      setEditing(null);
      setForm({ ...EMPTY_FORM });
      await loadProducts();
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Ошибка сохранения');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить товар?')) return;
    await api.delete(`/products/admin/${id}`);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // ── Images ───────────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!imgProduct || !e.target.files?.[0]) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', e.target.files[0]);
    fd.append('isMain', imgProduct.images.length === 0 ? 'true' : 'false');
    try {
      const { data } = await api.post(`/products/admin/${imgProduct.id}/images`, fd);
      setImgProduct(prev => prev ? { ...prev, images: [...prev.images, data] } : prev);
      setProducts(prev => prev.map(p => p.id === imgProduct.id
        ? { ...p, images: [...p.images, data] } : p));
    } catch { alert('Ошибка загрузки'); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDeleteImg = async (imageId: number) => {
    await api.delete(`/products/admin/images/${imageId}`);
    setImgProduct(prev => prev ? { ...prev, images: prev.images.filter(i => i.id !== imageId) } : prev);
    setProducts(prev => prev.map(p => p.id === imgProduct?.id
      ? { ...p, images: p.images.filter(i => i.id !== imageId) } : p));
  };

  const handleSetMain = async (imageId: number) => {
    if (!imgProduct) return;
    await api.put(`/products/admin/images/${imageId}/main`, { productId: imgProduct.id });
    setImgProduct(prev => prev
      ? { ...prev, images: prev.images.map(i => ({ ...i, isMain: i.id === imageId })) }
      : prev);
  };

  const allFlat = categories; // already flattened

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Package size={20} className="text-blue-600" /> Товары
          </h1>
          <span className="text-sm text-gray-400">{products.length} шт.</span>
        </div>
        <div className="flex items-center gap-2">
          <a href="/admin/orders" className="text-sm text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-gray-100">Заказы</a>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 text-sm font-semibold text-white px-3 py-1.5 rounded-lg"
            style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}
          >
            <Plus size={15} /> Добавить
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

        {/* ── Product list ── */}
        <div className="flex-1 min-w-0">
          {/* Search */}
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadProducts(search)}
              placeholder="Поиск по названию..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-400"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Товары не найдены</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {products.map(p => {
                const img = p.images?.find(i => i.isMain) || p.images?.[0];
                return (
                  <div key={p.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
                    {/* Image */}
                    <div className="relative aspect-square bg-gray-50">
                      {img
                        ? <img src={img.url} alt={p.name} className="w-full h-full object-contain p-2" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-200"><Package size={32} /></div>
                      }
                      {!p.isActive && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <span className="text-xs text-gray-400 font-medium">Скрыт</span>
                        </div>
                      )}
                      {/* Actions overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(p)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-blue-50">
                          <Pencil size={14} className="text-blue-600" />
                        </button>
                        <button onClick={() => setImgProduct(p)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-blue-50">
                          <ImagePlus size={14} className="text-green-600" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-red-50">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-700 line-clamp-2 leading-snug">{p.name}</p>
                      <p className="text-sm font-bold text-red-500 mt-1">{Number(p.price).toLocaleString()} сом</p>
                      <p className="text-[10px] text-gray-400">{p.category?.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Form panel ── */}
        {(editing !== undefined && form.name !== undefined && (editing !== null || form.categoryId !== undefined)) && (
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 text-sm">{editing ? 'Редактировать' : 'Новый товар'}</h2>
                <button onClick={() => { setEditing(null); setForm({ ...EMPTY_FORM }); }} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Название *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                    placeholder="Название товара"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Slug</label>
                  <input
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 font-mono"
                    placeholder="auto-slug"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Описание</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
                    rows={3}
                    placeholder="Краткое описание"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Цена (сом) *</label>
                    <input
                      type="number" value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Старая цена</label>
                    <input
                      type="number" value={form.oldPrice}
                      onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Склад (шт.)</label>
                  <input
                    type="number" value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Категория *</label>
                  <select
                    value={form.categoryId}
                    onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  >
                    <option value="">Выбрать...</option>
                    {allFlat.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox" checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm text-gray-600">Активен (виден на сайте)</span>
                </label>

                <button
                  onClick={handleSave}
                  disabled={saving || !form.name || !form.price || !form.categoryId}
                  className="w-full py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition-opacity"
                  style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}
                >
                  {saving ? 'Сохранение...' : editing ? 'Сохранить' : 'Создать товар'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Image manager modal ── */}
      {imgProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setImgProduct(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Фотографии</h2>
              <button onClick={() => setImgProduct(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <p className="text-xs text-gray-400 mb-4 line-clamp-1">{imgProduct.name}</p>

            {/* Existing images */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {imgProduct.images.map(img => (
                <div key={img.id} className="relative group aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <img src={img.url} alt="" className="w-full h-full object-contain p-1" />
                  {img.isMain && (
                    <div className="absolute top-1 left-1 bg-yellow-400 rounded px-1 py-0.5">
                      <Star size={10} className="text-white fill-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.isMain && (
                      <button onClick={() => handleSetMain(img.id)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center" title="Сделать главной">
                        <Star size={12} className="text-yellow-500" />
                      </button>
                    )}
                    <button onClick={() => handleDeleteImg(img.id)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                      <Trash2 size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Upload button */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {uploading
                  ? <span className="w-5 h-5 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
                  : <><ImagePlus size={20} className="text-gray-300" /><span className="text-[10px] text-gray-400">Добавить</span></>
                }
              </button>
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <p className="text-[11px] text-gray-400 text-center">
              JPG, PNG, WebP до 10 MB · Нажмите ⭐ чтобы сделать главной
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
