"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Image as ImageIcon, Loader2, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { adminGetBanners, adminCreateBanner, adminUpdateBanner, adminDeleteBanner, adminToggleBanner } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MultiImageUpload, parseImages, serializeImages } from "@/components/MultiImageUpload";

type Banner = {
  id: number; title: string; subtitle?: string; image: string; overlayStyle: string;
  buttonUrl?: string; buttonText?: string; isActive: boolean; position: number;
};

const OVERLAY_PRESETS = [
  {
    value: "none",
    label: "Только фото",
    desc: "Полное фото без затемнения",
    preview: { bg: "#000", imgOpacity: 1, gradient: "none" },
  },
  {
    value: "dark",
    label: "Тёмная тень",
    desc: "Лёгкая тень слева для текста",
    preview: { bg: "#000", imgOpacity: 1, gradient: "linear-gradient(to right,rgba(0,0,0,0.6),rgba(0,0,0,0.1),transparent)" },
  },
  {
    value: "dark-dim",
    label: "Тёмное затемнение",
    desc: "Фото приглушено + тёмный градиент",
    preview: { bg: "#000", imgOpacity: 0.5, gradient: "linear-gradient(to right,rgba(0,0,0,0.8),rgba(0,0,0,0.4))" },
  },
  {
    value: "blue",
    label: "Синий стиль",
    desc: "Фото приглушено + синий градиент",
    preview: { bg: "hsl(221,100%,28%)", imgOpacity: 0.5, gradient: "linear-gradient(to right,hsl(221,100%,28%,0.9),transparent)" },
  },
] as const;

type OverlayStyle = typeof OVERLAY_PRESETS[number]["value"];

type OverlayConfig = { containerBg: string; imgOpacity: number; gradient: string };
function getOverlay(style: string): OverlayConfig {
  switch (style) {
    case "none":     return { containerBg: "#000", imgOpacity: 1,   gradient: "" };
    case "dark":     return { containerBg: "#000", imgOpacity: 1,   gradient: "linear-gradient(to right,rgba(0,0,0,0.6),rgba(0,0,0,0.2),transparent)" };
    case "dark-dim": return { containerBg: "#000", imgOpacity: 0.5, gradient: "linear-gradient(to right,rgba(0,0,0,0.85),rgba(0,0,0,0.4))" };
    case "blue":     return { containerBg: "hsl(221,100%,28%)", imgOpacity: 0.5, gradient: "linear-gradient(to right,hsl(221deg 100% 28%/.9),transparent)" };
    default:         return { containerBg: "#000", imgOpacity: 1,   gradient: "" };
  }
}

const EMPTY_FORM = {
  title: "", subtitle: "", buttonUrl: "", buttonText: "",
  overlayStyle: "dark" as OverlayStyle,
  isActive: true, position: 0,
};

export default function AdminBannersPage() {
  const { user } = useAuthStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState<string[]>([]);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Auth/role redirect is handled by admin/layout.tsx.
    if (!user || user.role !== "ADMIN") return;
    load();
  }, [user]);

  const load = () => {
    setLoading(true);
    adminGetBanners().then(setBanners).catch(() => {}).finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImages([]);
    setPreviewIdx(0);
    setOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditing(b.id);
    setForm({
      title: b.title, subtitle: b.subtitle ?? "",
      buttonUrl: b.buttonUrl ?? "", buttonText: b.buttonText ?? "",
      overlayStyle: (b.overlayStyle ?? "dark") as OverlayStyle,
      isActive: b.isActive, position: b.position,
    });
    setImages(parseImages(b.image));
    setPreviewIdx(0);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || images.length === 0) return;
    setSaving(true);
    try {
      const payload = { ...form, image: serializeImages(images) };
      if (editing !== null) {
        const updated = await adminUpdateBanner(editing, payload);
        setBanners((bs) => bs.map((b) => b.id === editing ? updated : b));
      } else {
        const created = await adminCreateBanner(payload);
        setBanners((bs) => [...bs, created]);
      }
      setOpen(false);
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить баннер?")) return;
    await adminDeleteBanner(id);
    setBanners((bs) => bs.filter((b) => b.id !== id));
  };

  const handleToggle = async (id: number) => {
    const updated = await adminToggleBanner(id);
    setBanners((bs) => bs.map((b) => b.id === id ? { ...b, isActive: updated.isActive } : b));
  };

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        type={type}
        value={form[key] as string | number}
        onChange={(e) => setForm((f) => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-primary"
        style={{ borderColor: "hsl(var(--border))" }}
      />
    </div>
  );

  const activePreset = OVERLAY_PRESETS.find((p) => p.value === form.overlayStyle) ?? OVERLAY_PRESETS[1];
  const safePreviewIdx = Math.min(previewIdx, Math.max(0, images.length - 1));
  const previewImg = images[safePreviewIdx] ?? "";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Баннеры</h1>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-secondary animate-pulse" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">Нет баннеров. Добавьте первый!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {banners.map((b) => {
            const imgs = parseImages(b.image);
            const preset = OVERLAY_PRESETS.find((p) => p.value === b.overlayStyle) ?? OVERLAY_PRESETS[1];
            return (
              <div key={b.id} className={cn("relative overflow-hidden rounded-xl border bg-white", !b.isActive && "opacity-60")}
                style={{ borderColor: "hsl(var(--border))" }}>
                {imgs[0] && (
                  <div className="relative h-32" style={{ background: preset.preview.bg }}>
                    <Image src={imgs[0]} alt={b.title} fill className="object-cover"
                      style={{ opacity: preset.preview.imgOpacity }} unoptimized />
                    {preset.preview.gradient !== "none" && (
                      <div className="absolute inset-0" style={{ background: preset.preview.gradient }} />
                    )}
                    {imgs.length > 1 && (
                      <div className="absolute bottom-1.5 right-1.5 z-10 flex gap-1">
                        {imgs.slice(1, 4).map((img, i) => (
                          <div key={i} className="relative h-8 w-10 overflow-hidden rounded border-2 border-white/70">
                            <Image src={img} alt="" fill className="object-cover" unoptimized />
                          </div>
                        ))}
                        {imgs.length > 4 && (
                          <div className="flex h-8 w-8 items-center justify-center rounded border-2 border-white/70 bg-black/50 text-[10px] font-bold text-white">
                            +{imgs.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Style badge */}
                    <span className="absolute top-1.5 left-1.5 z-10 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                      {preset.label}
                    </span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{b.title}</p>
                      {b.subtitle && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{b.subtitle}</p>}
                      <p className="text-xs text-muted-foreground mt-1">Позиция: {b.position} · {imgs.length} фото</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleToggle(b.id)}
                        className={cn("flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                          b.isActive ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-secondary")}>
                        {b.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button onClick={() => openEdit(b)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing !== null ? "Редактировать" : "Новый"} баннер</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {field("Заголовок *", "title", "text", "Заголовок баннера")}
            {field("Подзаголовок", "subtitle", "text", "Описание")}
            {field("Ссылка кнопки", "buttonUrl", "text", "/catalog")}
            {field("Текст кнопки", "buttonText", "text", "Перейти")}
            {field("Позиция", "position", "number", "0")}

            {/* ── Live preview ── */}
            {(previewImg || form.title) && (() => {
              const ov = getOverlay(form.overlayStyle);
              return (
                <div>
                  <p className="mb-1.5 text-sm font-medium">
                    Предпросмотр
                    {images.length > 1 && (
                      <span className="ml-1.5 text-xs text-muted-foreground">— кликните на фото ниже чтобы выбрать</span>
                    )}
                  </p>
                  <div
                    className="relative h-44 overflow-hidden rounded-xl sm:h-52"
                    style={{ background: ov.containerBg }}
                  >
                    {previewImg && (
                      <Image
                        src={previewImg}
                        alt=""
                        fill
                        className="object-cover"
                        style={{ opacity: ov.imgOpacity }}
                        unoptimized
                      />
                    )}
                    {ov.gradient && (
                      <div className="absolute inset-0" style={{ background: ov.gradient }} />
                    )}
                    <div className="relative z-10 flex h-full flex-col justify-center px-6">
                      {form.title ? (
                        <h3 className="text-xl font-black leading-tight text-white sm:text-2xl">
                          {form.title}
                        </h3>
                      ) : (
                        <h3 className="text-xl font-black text-white/30">Заголовок баннера</h3>
                      )}
                      {form.subtitle && (
                        <p className="mt-2 text-sm text-white/80 line-clamp-2">{form.subtitle}</p>
                      )}
                      {form.buttonText && (
                        <div className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-primary">
                          {form.buttonText} <ArrowRight className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    {/* Badge */}
                    <span className="absolute top-2 right-2 z-10 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                      {activePreset.label}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Overlay style picker */}
            <div>
              <label className="mb-2 block text-sm font-medium">Стиль отображения фото</label>
              <div className="grid grid-cols-2 gap-2">
                {OVERLAY_PRESETS.map((preset) => {
                  const active = form.overlayStyle === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, overlayStyle: preset.value as OverlayStyle }))}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all hover:border-primary/40",
                        active ? "border-primary bg-primary/5" : "border-transparent bg-secondary/50"
                      )}
                    >
                      {/* Mini preview swatch */}
                      <div className="relative mt-0.5 h-10 w-14 shrink-0 overflow-hidden rounded-lg"
                        style={{ background: preset.preview.bg }}>
                        {/* Fake photo texture */}
                        <div className="absolute inset-0 opacity-60"
                          style={{ background: "linear-gradient(135deg, #555 0%, #888 50%, #444 100%)", opacity: preset.preview.imgOpacity }} />
                        {preset.preview.gradient !== "none" && (
                          <div className="absolute inset-0" style={{ background: preset.preview.gradient }} />
                        )}
                        {/* Fake text line */}
                        <div className="absolute bottom-1.5 left-1.5 h-1 w-5 rounded-full bg-white/80" />
                        <div className="absolute bottom-3 left-1.5 h-1 w-8 rounded-full bg-white/60" />
                      </div>
                      <div className="min-w-0">
                        <p className={cn("text-xs font-semibold", active ? "text-primary" : "text-foreground")}>
                          {preset.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{preset.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Изображения * <span className="text-xs text-muted-foreground">(первое — главное)</span>
              </label>
              <MultiImageUpload
                images={images}
                onChange={(imgs) => { setImages(imgs); if (previewIdx >= imgs.length) setPreviewIdx(Math.max(0, imgs.length - 1)); }}
                active={open}
                selectedIdx={safePreviewIdx}
                onSelect={setPreviewIdx}
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded accent-primary" />
              <label htmlFor="isActive" className="text-sm font-medium">Активен</label>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border py-2.5 text-sm font-medium hover:bg-secondary"
                style={{ borderColor: "hsl(var(--border))" }}>
                Отмена
              </button>
              <button onClick={handleSave} disabled={saving || !form.title || images.length === 0}
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
