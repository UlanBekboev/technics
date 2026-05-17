'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import {
  getCategoriesFlat,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  uploadImage,
} from '@/lib/api';
import { Pencil, Trash2, Plus, X, Upload, Loader2 } from 'lucide-react';

type Category = { id: number; name: string; slug: string; imageUrl?: string; parentId?: number };

const EMPTY_FORM = { name: '', slug: '', imageUrl: '', parentId: '' };

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
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
    setShowForm(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      imageUrl: c.imageUrl ?? '',
      parentId: c.parentId ? String(c.parentId) : '',
    });
    setShowForm(true);
  }

  async function handleUpload(files: FileList | null) {
    if (!files?.[0]) return;
    setUploading(true);
    try {
      const result = await uploadImage(files[0]);
      setForm((f) => ({ ...f, imageUrl: result.url }));
    } catch {
      alert('Ошибка загрузки изображения');
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        imageUrl: form.imageUrl || undefined,
        parentId: form.parentId ? parseInt(form.parentId) : null,
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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Категории</h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}
          >
            <Plus size={16} /> Добавить
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Фото</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Название</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Slug</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Родитель</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">Нет категорий</td>
                </tr>
              ) : categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {cat.parentId && <span className="text-gray-300 mr-1">└</span>}
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {cat.parentId ? (categories.find((c) => c.id === cat.parentId)?.name ?? '—') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={deleting === cat.id}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        {deleting === cat.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
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
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Изображение</label>
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200 mb-2" />
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 text-sm text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploading ? 'Загрузка...' : 'Загрузить фото'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
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
