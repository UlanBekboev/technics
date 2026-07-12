"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Loader2, Search, Layers } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { getBrands, adminCreateBrand, adminUpdateBrand, adminDeleteBrand } from "@/lib/api";
import { MultiImageUpload, parseImages, serializeImages } from "@/components/MultiImageUpload";

type Brand = { id: number; name: string; slug: string; logo?: string; description?: string };

function slugify(s: string) {
  return s.toLowerCase()
    .replace(/[а-яё]/g, (c: string) => ({ а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"ts",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminBrandsPage() {
  const { user } = useAuthStore();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [images, setImages] = useState<string[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Auth/role redirect is handled by admin/layout.tsx.
    if (!user || user.role !== "ADMIN") return;
    getBrands().then(setBrands).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "" });
    setImages([]);
    setOpen(true);
  };

  const openEdit = (b: Brand) => {
    setEditing(b.id);
    setForm({ name: b.name, slug: b.slug, description: b.description ?? "" });
    setImages(parseImages(b.logo));
    setOpen(true);
  };

  const handleNameChange = (v: string) => {
    setForm((f) => ({ ...f, name: v, slug: editing ? f.slug : slugify(v) }));
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) return;
    setSaving(true);
    try {
      const payload = { ...form, logo: serializeImages(images) };
      if (editing !== null) {
        const updated = await adminUpdateBrand(editing, payload);
        setBrands((bs) => bs.map((b) => b.id === editing ? updated : b));
      } else {
        const created = await adminCreateBrand(payload);
        setBrands((bs) => [...bs, created]);
      }
      setOpen(false);
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить бренд? Это может повлиять на товары.")) return;
    try {
      await adminDeleteBrand(id);
      setBrands((bs) => bs.filter((b) => b.id !== id));
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Ошибка удаления");
    }
  };

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-extrabold">Бренды</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск..."
              className="h-9 w-52 rounded-xl border pl-9 pr-3 text-sm outline-none focus:border-primary"
              style={{ borderColor: "hsl(var(--border))" }} />
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Добавить
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Layers className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">{search ? "Нет результатов" : "Брендов пока нет"}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((b) => {
            const imgs = parseImages(b.logo);
            const primary = imgs[0];
            return (
              <div key={b.id} className="flex items-center gap-3 rounded-xl border bg-white p-4 group hover:shadow-sm transition-shadow"
                style={{ borderColor: "hsl(var(--border))" }}>
                {primary ? (
                  <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-secondary">
                    <Image src={primary} alt={b.name} fill className="object-contain p-1" unoptimized />
                  </div>
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground font-bold text-sm">
                    {b.name[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate text-sm">{b.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.slug}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(b)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-secondary">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing !== null ? "Редактировать" : "Новый"} бренд</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Название *</label>
              <input value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Hikvision"
                className="h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-primary"
                style={{ borderColor: "hsl(var(--border))" }} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Slug *</label>
              <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="hikvision"
                className="h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-primary font-mono"
                style={{ borderColor: "hsl(var(--border))" }} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Логотип / изображения{" "}
                <span className="text-xs text-muted-foreground">(первое — главное)</span>
              </label>
              <MultiImageUpload images={images} onChange={setImages} active={open} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Описание</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2} placeholder="Краткое описание бренда"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                style={{ borderColor: "hsl(var(--border))" }} />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border py-2.5 text-sm font-medium hover:bg-secondary"
                style={{ borderColor: "hsl(var(--border))" }}>Отмена</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.slug}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Сохраняем..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
