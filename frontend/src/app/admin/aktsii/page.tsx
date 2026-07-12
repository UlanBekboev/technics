"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Wifi, Camera, Save, ImageIcon, CheckCircle, Plus, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { getSettings, adminUpdateSettings, uploadImage } from "@/lib/api";
import { parsePromoCameras, type PromoCamera } from "@/lib/settings";
import { EZVIZ_CAMERAS_DEFAULT, TVT_CAMERAS_DEFAULT } from "@/lib/promo-defaults";

type Group = "ezviz" | "tvt";

const EMPTY_CAMERA: PromoCamera = { name: "", type: "", image: "", price: 0, specs: [], slug: "" };

function CameraCard({
  groupKey, camera, onChange, onRemove,
  activeSlot, setActiveSlot, uploadFile, fileRefs, previews, uploading,
}: {
  groupKey: string; camera: PromoCamera;
  onChange: (patch: Partial<PromoCamera>) => void;
  onRemove: () => void;
  activeSlot: string | null; setActiveSlot: (k: string | null) => void;
  uploadFile: (key: string, file: File) => void;
  fileRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  previews: Record<string, string>; uploading: Record<string, boolean>;
}) {
  const isActive = activeSlot === groupKey;
  const preview = previews[groupKey] || "";
  const busy = uploading[groupKey];

  return (
    <div
      className="space-y-3 rounded-2xl border bg-white p-4 transition-shadow"
      style={{ borderColor: isActive ? "#3b82f6" : "hsl(var(--border))", boxShadow: isActive ? "0 0 0 2px #bfdbfe" : undefined }}
      onClick={() => setActiveSlot(groupKey)}
    >
      <div className="flex items-start gap-2">
        <input
          type="text"
          value={camera.name}
          placeholder="Название камеры"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full rounded-lg border px-2.5 py-1 text-sm font-semibold outline-none focus:border-blue-400"
          style={{ borderColor: "hsl(var(--border))" }}
        />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
          title="Удалить карточку"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        className="relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors"
        style={{ borderColor: preview || camera.image ? "#3b82f6" : "#e5e7eb", background: preview || camera.image ? "#eff6ff" : "#f9fafb" }}
        onClick={(e) => { e.stopPropagation(); setActiveSlot(groupKey); fileRefs.current[groupKey]?.click(); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); setActiveSlot(groupKey); const f = e.dataTransfer.files[0]; if (f) uploadFile(groupKey, f); }}
      >
        {busy ? (
          <div className="flex items-center gap-2 text-sm text-blue-500"><Loader2 className="h-4 w-4 animate-spin" /> Загружаем...</div>
        ) : preview ? (
          <Image src={preview} alt="preview" fill className="object-contain p-1" unoptimized />
        ) : camera.image ? (
          <Image src={camera.image} alt={camera.name} fill className="object-contain p-1" unoptimized />
        ) : (
          <div className="select-none px-3 text-center">
            <ImageIcon className="mx-auto mb-1 h-6 w-6 text-gray-300" />
            <p className="text-[10px] leading-tight text-gray-400">
              Кликнуть · перетащить<br />
              {isActive ? <span className="font-semibold text-blue-400">← Ctrl+V чтобы вставить</span> : <span>или кликните сюда → Ctrl+V</span>}
            </p>
          </div>
        )}
      </div>

      <input
        ref={(el) => { fileRefs.current[groupKey] = el; }}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(groupKey, f); e.target.value = ""; }}
      />

      <input
        type="text"
        value={camera.image}
        placeholder="или URL: https://..."
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onChange({ image: e.target.value })}
        className="w-full rounded-lg border px-3 py-1.5 text-xs outline-none focus:border-blue-400"
        style={{ borderColor: "hsl(var(--border))" }}
      />
      {camera.image && (
        <p className="flex items-center gap-1 text-[10px] text-green-600">
          <CheckCircle className="h-3 w-3" /> Фото загружено
        </p>
      )}

      <input
        type="text"
        value={camera.type}
        placeholder="Подпись, напр. «Кубическая поворотная 2МР»"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onChange({ type: e.target.value })}
        className="w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none focus:border-blue-400"
        style={{ borderColor: "hsl(var(--border))" }}
      />

      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={camera.price || ""}
          placeholder="Цена, сом"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onChange({ price: Number(e.target.value) || 0 })}
          className="w-28 rounded-lg border px-2.5 py-1.5 text-xs outline-none focus:border-blue-400"
          style={{ borderColor: "hsl(var(--border))" }}
        />
        <span className="text-xs text-gray-400">0 — цена не показывается</span>
      </div>

      <textarea
        value={camera.specs.join("\n")}
        placeholder={"Характеристики, по одной на строку\n2MP / 1080p\nIR ночь 10м\nWi-Fi"}
        rows={4}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onChange({ specs: e.target.value.split("\n") })}
        className="w-full resize-none rounded-lg border px-2.5 py-1.5 text-xs outline-none focus:border-blue-400"
        style={{ borderColor: "hsl(var(--border))" }}
      />

      <input
        type="text"
        value={camera.slug ?? ""}
        placeholder="Ссылка на товар — slug (необязательно)"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onChange({ slug: e.target.value })}
        className="w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none focus:border-blue-400"
        style={{ borderColor: "hsl(var(--border))" }}
      />
    </div>
  );
}

function CameraGroup({
  title, icon, groupPrefix, cameras, setCameras, ...shared
}: {
  title: string; icon: React.ReactNode; groupPrefix: string;
  cameras: PromoCamera[]; setCameras: (cams: PromoCamera[]) => void;
  activeSlot: string | null; setActiveSlot: (k: string | null) => void;
  uploadFile: (key: string, file: File) => void;
  fileRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  previews: Record<string, string>; uploading: Record<string, boolean>;
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold">{icon} {title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cameras.map((cam, i) => (
          <CameraCard
            key={`${groupPrefix}-${i}`}
            groupKey={`${groupPrefix}-${i}`}
            camera={cam}
            onChange={(patch) => setCameras(cameras.map((c, idx) => (idx === i ? { ...c, ...patch } : c)))}
            onRemove={() => setCameras(cameras.filter((_, idx) => idx !== i))}
            {...shared}
          />
        ))}
        <button
          type="button"
          onClick={() => setCameras([...cameras, { ...EMPTY_CAMERA }])}
          className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm font-medium text-gray-400 transition-colors hover:border-blue-300 hover:text-blue-500"
          style={{ borderColor: "#e5e7eb" }}
        >
          <Plus className="h-6 w-6" />
          Добавить камеру
        </button>
      </div>
    </section>
  );
}

export default function AdminAktsiiPage() {
  const { user } = useAuthStore();
  const [ezvizCameras, setEzvizCameras] = useState<PromoCamera[]>([]);
  const [tvtCameras, setTvtCameras] = useState<PromoCamera[]>([]);
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
      setEzvizCameras(parsePromoCameras(settings.promo_ezviz_cameras, EZVIZ_CAMERAS_DEFAULT));
      setTvtCameras(parsePromoCameras(settings.promo_tvt_cameras, TVT_CAMERAS_DEFAULT));
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
      const [group, idxStr] = key.split("-");
      const idx = Number(idxStr);
      if (group === "ezviz") setEzvizCameras((cams) => cams.map((c, i) => (i === idx ? { ...c, image: url } : c)));
      else setTvtCameras((cams) => cams.map((c, i) => (i === idx ? { ...c, image: url } : c)));
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
      await adminUpdateSettings({
        promo_ezviz_cameras: JSON.stringify(ezvizCameras.map((c) => ({ ...c, specs: c.specs.map((s) => s.trim()).filter(Boolean) }))),
        promo_tvt_cameras: JSON.stringify(tvtCameras.map((c) => ({ ...c, specs: c.specs.map((s) => s.trim()).filter(Boolean) }))),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { alert("Ошибка сохранения"); }
    setSaving(false);
  };

  const shared = { activeSlot, setActiveSlot, uploadFile, fileRefs, previews, uploading };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Акции — карточки камер</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Добавляйте, удаляйте и редактируйте карточки камер в каждой акции. Кликните на слот фото → <kbd className="rounded border border-gray-200 bg-gray-100 px-1 text-xs font-mono">Ctrl+V</kbd> чтобы вставить скриншот, или перетащите файл / введите URL.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? "Сохранено ✓" : "Сохранить"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Загрузка...</div>
      ) : (
        <>
          <CameraGroup
            title="Wi-Fi камеры EZVIZ"
            icon={<Wifi className="h-4 w-4 text-blue-500" />}
            groupPrefix="ezviz"
            cameras={ezvizCameras}
            setCameras={setEzvizCameras}
            {...shared}
          />
          <CameraGroup
            title="TVT камеры (комплект под ключ)"
            icon={<Camera className="h-4 w-4 text-blue-800" />}
            groupPrefix="tvt"
            cameras={tvtCameras}
            setCameras={setTvtCameras}
            {...shared}
          />
        </>
      )}
    </div>
  );
}
