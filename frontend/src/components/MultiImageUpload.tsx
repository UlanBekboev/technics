"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, Plus, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/api";

export function parseImages(raw: string | undefined): string[] {
  if (!raw) return [];
  const t = raw.trimStart();
  if (t.startsWith("[")) {
    try { return (JSON.parse(t) as string[]).filter(Boolean); } catch {}
  }
  return [raw].filter(Boolean);
}

export function serializeImages(imgs: string[]): string {
  const clean = imgs.filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  return JSON.stringify(clean);
}

interface Props {
  images: string[];
  onChange: (imgs: string[]) => void;
  /** Pass open/true when the parent modal is visible — enables global Ctrl+V */
  active: boolean;
  /** Index of the currently selected image (for preview) */
  selectedIdx?: number;
  /** Called when user clicks a thumbnail to select it for preview */
  onSelect?: (idx: number) => void;
}

export function MultiImageUpload({ images, onChange, active, selectedIdx, onSelect }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // stable refs so the paste handler never captures stale state
  const imagesRef = useRef(images);
  const onChangeRef = useRef(onChange);
  imagesRef.current = images;
  onChangeRef.current = onChange;

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const local = URL.createObjectURL(file);
    setPreview(local);
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      onChangeRef.current([...imagesRef.current, url]);
    } catch {
      alert("Ошибка загрузки");
    } finally {
      setUploading(false);
      URL.revokeObjectURL(local);
      setPreview("");
    }
  };

  const uploadFileRef = useRef(uploadFile);
  uploadFileRef.current = uploadFile;

  // Ctrl+V while modal is open (skip when user is typing in an input)
  useEffect(() => {
    if (!active) return;
    const onPaste = (e: ClipboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
      if (item) { const f = item.getAsFile(); if (f) uploadFileRef.current(f); }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [active]);

  const remove = (i: number) => onChange(images.filter((_, j) => j !== i));

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    onChange([...images, url]);
    setUrlInput("");
  };

  return (
    <div className="space-y-2">
      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => {
            const isSelected = selectedIdx !== undefined ? selectedIdx === i : i === 0;
            return (
              <div
                key={i}
                className="group relative h-16 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all"
                style={{ borderColor: isSelected ? "#3b82f6" : "hsl(var(--border))" }}
                onClick={() => onSelect?.(i)}
                title="Кликните для предпросмотра"
              >
                <Image src={img} alt="" fill className="object-cover" unoptimized />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-blue-500/90 text-center text-[9px] font-bold text-white leading-4">
                    главное
                  </span>
                )}
                {isSelected && onSelect && (
                  <div className="absolute inset-0 ring-2 ring-inset ring-blue-400 rounded-[6px] pointer-events-none" />
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); remove(i); }}
                  className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Drop / add zone */}
      <div
        className="relative flex h-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-colors hover:border-blue-400 hover:bg-blue-50"
        style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--secondary))" }}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          Array.from(e.dataTransfer.files).forEach((f) => uploadFile(f));
        }}
      >
        {uploading ? (
          <div className="flex items-center gap-2 text-sm text-blue-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Загружаем...
          </div>
        ) : preview ? (
          <Image src={preview} alt="" fill className="object-contain rounded-xl p-1" unoptimized />
        ) : (
          <div className="select-none text-center">
            <Plus className="mx-auto mb-0.5 h-5 w-5 text-muted-foreground/40" />
            <p className="text-[11px] text-muted-foreground/70">
              {images.length === 0 ? "Добавить фото" : "Ещё фото"} ·{" "}
              <kbd className="rounded border border-gray-200 bg-gray-100 px-1 font-mono text-[10px]">Ctrl+V</kbd> · перетащить
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          Array.from(e.target.files ?? []).forEach((f) => uploadFile(f));
          e.target.value = "";
        }}
      />

      {/* URL input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
          placeholder="или вставьте URL: https://emin.kg/files/..."
          className="h-8 flex-1 rounded-lg border px-3 text-xs outline-none focus:border-blue-400"
          style={{ borderColor: "hsl(var(--border))" }}
        />
        {urlInput.trim() && (
          <button
            type="button"
            onClick={addUrl}
            className="h-8 shrink-0 rounded-lg bg-blue-500 px-3 text-xs font-semibold text-white hover:bg-blue-600"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}
