'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { getCategoriesFlat, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '@/lib/api';
import { Pencil, Trash2, Plus, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { MultiImageUpload, parseImages, serializeImages } from '@/components/MultiImageUpload';

type Category = { id: number; name: string; slug: string; imageUrl?: string; parentId?: number; showInCatalog?: boolean; featured?: boolean; position?: number };

const EMPTY_FORM = { name: '', slug: '', parentId: '', showInCatalog: true, featured: false, position: '0' };

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[а-яё]/g, (c) => ({ а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' }[c] ?? c))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminCategoriesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'ADMIN') { router.push('/'); return; }
    load();
  }, [user]);

  async function load() {
    setLoading(true);
    const cats = await getCategoriesFlat().catch(() => []);
    setCategories(cats);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImages([]);
    setShowForm(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      parentId: c.parentId ? String(c.parentId) : '',
      showInCatalog: c.showInCatalog !== false,
      featured: c.featured ?? false,
      position: String(c.position ?? 0),
    });
    setImages(parseImages(c.imageUrl));
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        imageUrl: serializeImages(images) || undefined,
        parentId: form.parentId ? parseInt(form.parentId) : null,
        showInCatalog: form.showInCatalog,
        featured: form.featured,
        position: parseInt(form.position) || 0,
      };
      if (editing) {
        const updated = await adminUpdateCategory(editing.id, payload);
        setCategories((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
      } else {
        const created = await adminCreateCategory(payload);
        setCategories((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditing(null);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Ошибка сохранения');
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить категорию? Товары останутся, но потеряют привязку.')) return;
    setDeleting(id);
    try {
      await adminDeleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Ошибка удаления');
    }
    setDeleting(null);
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-400 text-sm">Загрузка...</div>
  );

  const rootCats = categories.filter((c) => !c.parentId);

  return (
    <div className="bg-gray-50 min-h-screen overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-3 xs:px-4 py-6 xs:py-8">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Категории</h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 text-white text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[260px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-2 xs:px-4 py-3 font-semibold text-gray-600">Фото</th>
                <th className="text-left px-2 xs:px-4 py-3 font-semibold text-gray-600">Название</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Slug</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Родитель</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Видимость</th>
                <th className="px-2 xs:px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">Нет категорий</td>
                </tr>
              ) : categories.map((cat) => {
                const primary = parseImages(cat.imageUrl)[0];
                return (
                  <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-2 xs:px-4 py-3">
                      {primary ? (
                        <div className="relative w-8 h-8 2xs:w-10 2xs:h-10 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0">
                          <Image src={primary} alt="" fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-8 h-8 2xs:w-10 2xs:h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                      )}
                    </td>
                    <td className="px-2 xs:px-4 py-3 max-w-0 w-full">
                      <div className="font-medium text-gray-900 truncate">
                        {cat.parentId && <span className="text-gray-300 mr-1">└</span>}
                        {cat.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs hidden sm:table-cell">{cat.slug}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {cat.parentId ? (categories.find((c) => c.id === cat.parentId)?.name ?? '—') : '—'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {cat.showInCatalog !== false
                          ? <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">каталог</span>
                          : <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">скрыт</span>}
                        {cat.featured && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 font-semibold">главная</span>}
                      </div>
                    </td>
                    <td className="px-2 xs:px-4 py-3">
                      <div className="flex items-center gap-0.5 xs:gap-1 justify-end">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-1.5 xs:p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          disabled={deleting === cat.id}
                          className="p-1.5 xs:p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          {deleting === cat.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? 'Редактировать категорию' : 'Новая категория'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Название *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slug *</label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Родительская категория</label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">Нет (корневая)</option>
                  {rootCats
                    .filter((c) => c.id !== editing?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Изображения <span className="font-normal text-gray-400">(первое — главное)</span>
                </label>
                <MultiImageUpload images={images} onChange={setImages} active={showForm} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Позиция (порядок сортировки)</label>
                <input
                  type="number"
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="0 — по умолчанию"
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.showInCatalog}
                    onChange={(e) => setForm((f) => ({ ...f, showInCatalog: e.target.checked }))}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">Показывать в каталоге</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                    className="w-4 h-4 rounded accent-orange-500"
                  />
                  <span className="text-sm text-gray-700">Показывать на главной</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
    </div>
  );
}
