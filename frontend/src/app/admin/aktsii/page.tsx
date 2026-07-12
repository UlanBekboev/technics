"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Wifi, Camera, Save, ImageIcon, CheckCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { getSettings, adminUpdateSettings, uploadImage } from "@/lib/api";

const EZVIZ_SLOTS = [
  { key: "promo_ezviz_0", nameKey: "promo_ezviz_0_name", label: "EZVIZ H6c Pro" },
  { key: "promo_ezviz_1", nameKey: "promo_ezviz_1_name", label: "EZVIZ H6C Pro 3K" },
  { key: "promo_ezviz_2", nameKey: "promo_ezviz_2_name", label: "EZVIZ H8c PRO 3K" },
  { key: "promo_ezviz_3", nameKey: "promo_ezviz_3_name", label: "EZVIZ H1c" },
];

const TVT_SLOTS = [
  { key: "promo_tvt_0", nameKey: "promo_tvt_0_name", label: "TVT TD-9540S5L-D" },
  { key: "promo_tvt_1", nameKey: "promo_tvt_1_name", label: "TVT TD-9440S5L-D" },
];

const ALL_SLOTS = [...EZVIZ_SLOTS, ...TVT_SLOTS];

function SlotCard({
  slotKey, nameKey, defaultLabel, images, previews, uploading, activeSlot, setActiveSlot,
  uploadFile, fileRefs, setImages, names, setNames,
}: {
  slotKey: string; nameKey: string; defaultLabel: string;
  images: Record<string, string>; previews: Record<string, string>;
  uploading: Record<string, boolean>; activeSlot: string | null;
  setActiveSlot: (k: string | null) => void;
  uploadFile: (key: string, file: File) => void;
  fileRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  setImages: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  names: Record<string, string>;
  setNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const isActive = activeSlot === slotKey;
  const preview = previews[slotKey] || "";
  const img = images[slotKey] || "";
  const busy = uploading[slotKey];
  const name = names[nameKey] ?? defaultLabel;

  return (
    <div
      className="rounded-2xl border bg-white p-4 space-y-3 transition-shadow"
      style={{ borderColor: isActive ? "#3b82f6" : "hsl(var(--border))", boxShadow: isActive ? "0 0 0 2px #bfdbfe" : undefined }}
      onClick={() => setActiveSlot(slotKey)}
    >
      {/* Editable name */}
      <input
        type="text"
        value={name}
        placeholder={defaultLabel}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setNames((prev) => ({ ...prev, [nameKey]: e.target.value }))}
        className="w-full rounded-lg border px-2.5 py-1 text-sm font-semibold outline-none focus:border-blue-400 bg-transparent"
        style={{ borderColor: "hsl(var(--border))" }}
      />

      {/* Drop zone */}
      <div
        className="relative h-32 rounded-xl border-2 border-dashed overflow-hidden cursor-pointer transition-colors flex items-center justify-center"
        style={{ borderColor: preview || img ? "#3b82f6" : "#e5e7eb", background: preview || img ? "#eff6ff" : "#f9fafb" }}
        onClick={(e) => { e.stopPropagation(); setActiveSlot(slotKey); fileRefs.current[slotKey]?.click(); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); setActiveSlot(slotKey); const f = e.dataTransfer.files[0]; if (f) uploadFile(slotKey, f); }}
      >
        {busy ? (
          <div className="flex items-center gap-2 text-sm text-blue-500"><Loader2 className="h-4 w-4 animate-spin" /> Загружаем...</div>
        ) : preview ? (
          <Image src={preview} alt="preview" fill className="object-contain p-1" unoptimized />
        ) : img ? (
          <Image src={img} alt={name} fill className="object-contain p-1" unoptimized />
        ) : (
          <div className="text-center px-3 select-none">
            <ImageIcon className="h-6 w-6 mx-auto mb-1 text-gray-300" />
            <p className="text-[10px] text-gray-400 leading-tight">
              Кликнуть · перетащить<br />
              {isActive ? (
                <span className="font-semibold text-blue-400">← Ctrl+V чтобы вставить</span>
              ) : (
                <span>или кликните сюда → Ctrl+V</span>
              )}
            </p>
          </div>
        )}
      </div>

      <input
        ref={(el) => { fileRefs.current[slotKey] = el; }}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(slotKey, f); e.target.value = ""; }}
      />

      {/* URL input */}
      <input
        type="text"
        value={img}
        placeholder="или URL: https://emin.kg/files/..."
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setImages((prev) => ({ ...prev, [slotKey]: e.target.value }))}
        className="w-full rounded-lg border px-3 py-1.5 text-xs outline-none focus:border-blue-400"
        style={{ borderColor: "hsl(var(--border))" }}
      />

      {img && (
        <p className="flex items-center gap-1 text-[10px] text-green-600">
          <CheckCircle className="h-3 w-3" /> Фото загружено
        </p>
      )}
    </div>
  );
}

export default function AdminAktsiiPage() {
  const { user } = useAuthStore();
  const [images, setImages] = useState<Record<string, string>>({});
  const [names, setNames] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    // Auth/role redirect is handled by admin/layout.tsx.
    if (!user || user.role !== "ADMIN") return;
    getSettings().then((settings) => {
      const imgs: Record<string, string> = {};
      const nms: Record<string, string> = {};
      for (const slot of ALL_SLOTS) {
        imgs[slot.key] = settings[slot.key] ?? "";
        nms[slot.nameKey] = settings[slot.nameKey] ?? "";
      }
      setImages(imgs);
      setNames(nms);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const uploadFile = useCallback(async (key: string, file: File) => {
    if (!file.type.startsWith("image/")) return;
    const local = URL.createObjectURL(file);
    setPreviews((p) => ({ ...p, [key]: local }));
    setUploading((u) => ({ ...u, [key]: true }));
    try {
      const { url } = await uploadImage(file);
      setImages((imgs) => ({ ...imgs, [key]: url }));
    } catch { alert("Ошибка загрузки"); }
    setUploading((u) => ({ ...u, [key]: false }));
    URL.revokeObjectURL(local);
    setPreviews((p) => ({ ...p, [key]: "" }));
  }, []);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (!activeSlot) return;
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
      if (item) { const f = item.getAsFile(); if (f) uploadFile(activeSlot, f); }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [activeSlot, uploadFile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminUpdateSettings({ ...images, ...names });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { alert("Ошибка сохранения"); }
    setSaving(false);
  };

  const slotProps = { images, previews, uploading, activeSlot, setActiveSlot, uploadFile, fileRefs, setImages, names, setNames };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold">Акции — фото камер</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Кликните на слот → нажмите <kbd className="rounded bg-gray-100 border border-gray-200 px-1 text-xs font-mono">Ctrl+V</kbd> чтобы вставить скриншот.
            Или перетащите файл / введите URL. Имена камер тоже можно изменить.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 shrink-0"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? "Сохранено ✓" : "Сохранить"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Загрузка...</div>
      ) : (
        <>
          {/* EZVIZ */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
              <Wifi className="h-4 w-4 text-blue-500" /> Wi-Fi камеры EZVIZ
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {EZVIZ_SLOTS.map((slot) => (
                <SlotCard
                  key={slot.key}
                  {...slotProps}
                  slotKey={slot.key}
                  nameKey={slot.nameKey}
                  defaultLabel={slot.label}
                />
              ))}
            </div>
          </section>

          {/* TVT */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
              <Camera className="h-4 w-4 text-blue-800" /> TVT камеры (комплект под ключ)
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {TVT_SLOTS.map((slot) => (
                <SlotCard
                  key={slot.key}
                  {...slotProps}
                  slotKey={slot.key}
                  nameKey={slot.nameKey}
                  defaultLabel={slot.label}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
