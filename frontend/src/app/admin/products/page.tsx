'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  getCloudinaryParams,
  adminSaveProductImageUrl,
  getCategoriesFlat,
  getBrands,
  uploadImage,
} from '@/lib/api';
import { Pencil, Trash2, Plus, X, Upload, Loader2, RefreshCw, ImagePlus, MoreVertical } from 'lucide-react';

type Category = { id: number; name: string; slug: string };
type Brand = { id: number; name: string; slug: string };
type ProductImage = { url: string; isMain?: boolean };
type Product = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  oldPrice?: number;
  stock: number;
  isActive: boolean;
  categoryId: number;
  brandId?: number;
  category: Category;
  brand?: Brand;
  images: ProductImage[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
};

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  price: '',
  oldPrice: '',
  stock: '0',
  isActive: true,
  isNew: false,
  categoryId: '',
  brandId: '',
  images: [] as ProductImage[],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[а-яё]/g, (c) => ({ а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' }[c] ?? c))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminProductsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [fetchingImg, setFetchingImg] = useState<number | null>(null);
  const [imgModal, setImgModal] = useState<Product | null>(null);
  const [pastedFile, setPastedFile] = useState<File | null>(null);
  const [pastedPreview, setPastedPreview] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [slugLocked, setSlugLocked] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'ADMIN') { router.push('/'); return; }
    load();
  }, [user]);

  // Закрывает dropdown по клику вне
  useEffect(() => {
    if (openDropdown === null) return;
    const close = () => setOpenDropdown(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openDropdown]);

  async function load() {
    setLoading(true);
    const [prods, cats, brnds] = await Promise.all([
      adminGetProducts().catch(() => []),
      getCategoriesFlat().catch(() => []),
      getBrands().catch(() => []),
    ]);
    setProducts(prods);
    setCategories(cats);
    setBrands(brnds);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSlugLocked(false);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description ?? '',
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : '',
      stock: String(p.stock),
      isActive: p.isActive,
      isNew: (p as any).isNew ?? false,
      categoryId: String(p.categoryId),
      brandId: p.brandId ? String(p.brandId) : '',
      images: p.images,
      seoTitle: p.seoTitle ?? '',
      seoDescription: p.seoDescription ?? '',
      seoKeywords: p.seoKeywords ?? '',
    });
    setSlugLocked(true);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((f) => uploadImage(f)),
      );
      setForm((prev) => ({
        ...prev,
        images: [
          ...prev.images,
          ...uploaded.map((r, i) => ({ url: r.url, isMain: prev.images.length === 0 && i === 0 })),
        ],
      }));
    } catch {
      alert('Ошибка загрузки изображения');
    }
    setUploading(false);
  }

  function setMain(idx: number) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({ ...img, isMain: i === idx })),
    }));
  }

  function removeImage(idx: number) {
    setForm((prev) => {
      const imgs = prev.images.filter((_, i) => i !== idx);
      if (imgs.length > 0 && !imgs.some((i) => i.isMain)) imgs[0].isMain = true;
      return { ...prev, images: imgs };
    });
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        price: parseFloat(form.price),
        oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : undefined,
        stock: parseInt(form.stock),
        isActive: form.isActive,
        isNew: form.isNew,
        categoryId: parseInt(form.categoryId),
        brandId: form.brandId ? parseInt(form.brandId) : undefined,
        images: form.images,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        seoKeywords: form.seoKeywords || undefined,
      };
      if (editing) {
        const updated = await adminUpdateProduct(editing.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === editing.id ? updated : p)));
      } else {
        const created = await adminCreateProduct(payload);
        setProducts((prev) => [created, ...prev]);
      }
      closeForm();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Ошибка сохранения');
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить товар?')) return;
    setDeleting(id);
    try {
      await adminDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Ошибка удаления');
    }
    setDeleting(null);
  }

  function closeImgModal() {
    setImgModal(null);
    setPastedFile(null);
    setImgUrl('');
    if (pastedPreview) { URL.revokeObjectURL(pastedPreview); setPastedPreview(''); }
  }

  function pickImgFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    if (pastedPreview) URL.revokeObjectURL(pastedPreview);
    setPastedFile(file);
    setPastedPreview(URL.createObjectURL(file));
  }

  // Ctrl+V глобальный listener пока модал открыт
  useEffect(() => {
    if (!imgModal) return;
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith('image/'));
      if (item) { const f = item.getAsFile(); if (f) pickImgFile(f); }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [imgModal]);

  async function handleSaveUrl(p: Product, url: string) {
    if (!url.trim()) return;
    setFetchingImg(p.id);
    closeImgModal();
    try {
      const res = await adminSaveProductImageUrl(p.id, url.trim());
      setProducts((prev) => prev.map((item) =>
        item.id === p.id
          ? { ...item, images: [{ url: url.trim(), isMain: res.isMain ?? false }, ...item.images] }
          : item,
      ));
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Ошибка сохранения URL');
    }
    setFetchingImg(null);
  }

  async function handleUploadFile(p: Product, file: File) {
    setFetchingImg(p.id);
    closeImgModal();
    try {
      // 1. Получаем параметры подписи с бэкенда (без сетевых вызовов на сервере)
      const params = await getCloudinaryParams();

      // 2. Загружаем напрямую из браузера в Cloudinary
      const form = new FormData();
      form.append('file', file);
      form.append('signature', params.signature);
      form.append('timestamp', String(params.timestamp));
      form.append('api_key', params.apiKey);
      form.append('folder', params.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`,
        { method: 'POST', body: form },
      );
      const uploadData = await uploadRes.json();
      if (!uploadData.secure_url) throw new Error(uploadData.error?.message ?? 'Cloudinary upload failed');

      // 3. Сохраняем URL в базе
      const res = await adminSaveProductImageUrl(p.id, uploadData.secure_url);

      setProducts((prev) => prev.map((item) =>
        item.id === p.id
          ? { ...item, images: [{ url: uploadData.secure_url, isMain: res.isMain ?? false }, ...item.images.filter((img) => !img.url.includes('placehold'))] }
          : item,
      ));
    } catch (err: any) {
      alert(err?.message ?? err?.response?.data?.message ?? 'Ошибка загрузки изображения');
    }
    setFetchingImg(null);
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400 text-sm">Загрузка...</div>
  );

  return (
    <div className="bg-gray-50 min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 py-6 xs:py-8">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Товары</h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 text-white text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}
          >
            <Plus size={16} />
            <span className="hidden xs:inline sm:inline">Добавить товар</span>
          </button>
        </div>

        <input
          type="text"
          placeholder="Поиск по названию или категории..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400"
        />

        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[280px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-2 xs:px-4 py-3 font-semibold text-gray-600">Товар</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Категория</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Цена</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden xl:table-cell">Склад</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Статус</th>
                <th className="px-2 xs:px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">Нет товаров</td>
                </tr>
              ) : filtered.map((p) => {
                const mainImg = p.images.find((i) => i.isMain) ?? p.images[0];
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Фото + название — кликабельны */}
                    <td className="px-2 xs:px-4 py-3 max-w-0 w-full">
                      <a
                        href={`/product/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 xs:gap-3 group w-full"
                        title="Открыть страницу товара"
                      >
                        {mainImg ? (
                          <img src={mainImg.url} alt="" className="w-9 h-9 xs:w-12 xs:h-12 object-cover rounded-lg border border-gray-100 flex-shrink-0 group-hover:border-blue-300 transition-colors" />
                        ) : (
                          <div className="w-9 h-9 xs:w-12 xs:h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs flex-shrink-0">нет</div>
                        )}
                        <div className="min-w-0 overflow-hidden flex-1">
                          <div className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">{p.name}</div>
                          <div className="text-xs text-gray-400 truncate">{p.slug}</div>
                        </div>
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{p.category?.name}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap hidden sm:table-cell">
                      {Number(p.price).toLocaleString('ru')} сом
                      {p.oldPrice && (
                        <div className="text-xs text-gray-400 line-through">{Number(p.oldPrice).toLocaleString('ru')}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden xl:table-cell">{p.stock} шт</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isActive ? 'Активен' : 'Скрыт'}
                      </span>
                    </td>
                    <td className="px-2 xs:px-4 py-3">
                      {/* ── Три точки: только < 390px ── */}
                      <div className="relative 2xs:hidden flex justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === p.id ? null : p.id); }}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        >
                          <MoreVertical size={15} />
                        </button>
                        {openDropdown === p.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-30 overflow-hidden min-w-[130px]">
                            <button
                              onClick={() => { openEdit(p); setOpenDropdown(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <Pencil size={13} /> Изменить
                            </button>
                            <button
                              onClick={() => { setImgModal(p); setPastedFile(null); setPastedPreview(''); setOpenDropdown(null); }}
                              disabled={fetchingImg === p.id}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-50"
                            >
                              {fetchingImg === p.id
                                ? <Loader2 size={13} className="animate-spin text-green-500" />
                                : <ImagePlus size={13} />}
                              Фото
                            </button>
                            <button
                              onClick={() => { handleDelete(p.id); setOpenDropdown(null); }}
                              disabled={deleting === p.id}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 border-t border-gray-50"
                            >
                              {deleting === p.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                              Удалить
                            </button>
                          </div>
                        )}
                      </div>

                      {/* ── Обычные кнопки: >= 390px ── */}
                      <div className="hidden 2xs:flex items-center gap-0.5 xs:gap-1 justify-end">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 xs:p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Редактировать"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => { setImgModal(p); setPastedFile(null); setPastedPreview(''); }}
                          disabled={fetchingImg === p.id}
                          className="p-1.5 xs:p-2 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                          title="Загрузить фото (скриншот / файл)"
                        >
                          {fetchingImg === p.id
                            ? <Loader2 size={14} className="animate-spin text-green-500" />
                            : <ImagePlus size={14} />}
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="p-1.5 xs:p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Удалить"
                        >
                          {deleting === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? 'Редактировать товар' : 'Новый товар'}
              </h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Название *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: slugLocked ? f.slug : slugify(e.target.value),
                    }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-600">Slug *</label>
                    {slugLocked && (
                      <button
                        type="button"
                        onClick={() => { setSlugLocked(false); setForm((f) => ({ ...f, slug: slugify(f.name) })); }}
                        className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <RefreshCw size={11} /> Сгенерировать из названия
                      </button>
                    )}
                  </div>
                  <input
                    required
                    value={form.slug}
                    onChange={(e) => { setSlugLocked(true); setForm((f) => ({ ...f, slug: e.target.value })); }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Цена (сом) *</label>
                  <input
                    required type="number" min="0" step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Старая цена</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={form.oldPrice}
                    onChange={(e) => setForm((f) => ({ ...f, oldPrice: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Категория *</label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option value="">Выберите...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Бренд</label>
                  <select
                    value={form.brandId}
                    onChange={(e) => setForm((f) => ({ ...f, brandId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option value="">Не указан</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Остаток (шт)</label>
                  <input
                    type="number" min="0"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="flex flex-col gap-2 pt-5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox" id="isActive"
                      checked={form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700 font-medium">Активен</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox" id="isNew"
                      checked={form.isNew}
                      onChange={(e) => setForm((f) => ({ ...f, isNew: e.target.checked }))}
                      className="w-4 h-4 rounded accent-green-600"
                    />
                    <label htmlFor="isNew" className="text-sm text-gray-700 font-medium flex items-center gap-1.5">
                      Новинка
                      <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">НОВИНКА</span>
                    </label>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Описание</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
                  />
                </div>
                <div className="col-span-2 space-y-3 rounded-lg border border-gray-100 bg-gray-50/60 p-3">
                  <p className="text-xs font-semibold text-gray-500">
                    SEO <span className="font-normal text-gray-400">(необязательно — переопределяет автоматический заголовок/описание в поиске)</span>
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">SEO-заголовок</label>
                    <input
                      value={form.seoTitle}
                      onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
                      placeholder={form.name ? `${form.name} — купить в Бишкеке | TECHNICS` : ''}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">SEO-описание</label>
                    <textarea
                      rows={2}
                      value={form.seoDescription}
                      onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
                      placeholder="Показывается в результатах поиска под заголовком"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ключевые слова</label>
                    <input
                      value={form.seoKeywords}
                      onChange={(e) => setForm((f) => ({ ...f, seoKeywords: e.target.value }))}
                      placeholder="ip камера, видеонаблюдение, hikvision"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Фотографии</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img.url}
                        alt=""
                        onClick={() => setMain(idx)}
                        className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition-colors ${img.isMain ? 'border-blue-500' : 'border-gray-200 hover:border-blue-300'}`}
                        title="Нажмите — сделать главным"
                      />
                      {img.isMain && (
                        <span className="absolute bottom-1 left-1 text-[10px] bg-blue-500 text-white px-1 rounded">гл.</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    <span className="text-[10px] mt-1">{uploading ? '...' : 'Загрузить'}</span>
                  </button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}
                >
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {editing ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модал загрузки фото через скриншот / файл */}
      {imgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">Загрузить фото</h2>
              <button onClick={closeImgModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-4 truncate">
              {imgModal.name}
            </p>

            {/* URL поле */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Вставить URL фото (например, с emin.kg)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://emin.kg/files/..."
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
                <button
                  onClick={() => handleSaveUrl(imgModal, imgUrl)}
                  disabled={!imgUrl.trim() || fetchingImg === imgModal.id}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}
                >
                  Сохранить
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">или загрузить файл / скриншот</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Зона вставки / перетаскивания */}
            <div
              className="border-2 border-dashed rounded-xl mb-4 flex items-center justify-center cursor-pointer transition-colors"
              style={{ minHeight: 180, borderColor: pastedFile ? '#22c55e' : '#d1d5db', background: pastedFile ? '#f0fdf4' : '#f9fafb' }}
              onClick={() => imgFileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) pickImgFile(f); }}
            >
              {pastedPreview ? (
                <img src={pastedPreview} alt="preview" className="max-h-44 max-w-full object-contain rounded-lg p-2" />
              ) : (
                <div className="text-center text-gray-400 px-4 py-6 select-none">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-sm font-semibold text-gray-600">Нажмите <kbd className="bg-gray-100 border border-gray-200 rounded px-1 py-0.5 text-xs font-mono">Ctrl+V</kbd> чтобы вставить скриншот</p>
                  <p className="text-xs mt-2 text-gray-400">или нажмите сюда / перетащите файл</p>
                  <p className="text-xs mt-3 text-gray-300">Найдите фото на <a onClick={(e) => e.stopPropagation()} href={`https://www.google.com/search?q=${encodeURIComponent(imgModal.name)}&tbm=isch`} target="_blank" rel="noreferrer" className="text-blue-400 underline">Google</a> или <a onClick={(e) => e.stopPropagation()} href={`https://yandex.ru/images/search?text=${encodeURIComponent(imgModal.name)}`} target="_blank" rel="noreferrer" className="text-blue-400 underline">Яндекс</a>, сделайте скриншот <kbd className="bg-gray-100 border border-gray-200 rounded px-1 text-xs font-mono">Win+Shift+S</kbd> и нажмите Ctrl+V</p>
                </div>
              )}
            </div>

            <input ref={imgFileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) pickImgFile(f); e.target.value = ''; }} />

            <div className="flex gap-3">
              <button onClick={closeImgModal} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                Отмена
              </button>
              <button
                onClick={() => pastedFile && handleUploadFile(imgModal, pastedFile)}
                disabled={!pastedFile || fetchingImg === imgModal.id}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}
              >
                {fetchingImg === imgModal.id
                  ? <><Loader2 size={14} className="animate-spin" /> Загрузка...</>
                  : <><ImagePlus size={14} /> Загрузить</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
