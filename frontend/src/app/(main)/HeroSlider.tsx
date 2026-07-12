"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/types";

function parseImages(raw: string): string[] {
  if (!raw) return [];
  const t = raw.trimStart();
  if (t.startsWith("[")) {
    try { return (JSON.parse(t) as string[]).filter(Boolean); } catch {}
  }
  return [raw];
}

type OverlayConfig = { containerBg: string; imgOpacity: number; gradient: string };

function getOverlay(style?: string): OverlayConfig {
  switch (style) {
    case "none":
      return { containerBg: "#000", imgOpacity: 1, gradient: "" };
    case "dark":
      return { containerBg: "#000", imgOpacity: 1, gradient: "linear-gradient(to right,rgba(0,0,0,0.6),rgba(0,0,0,0.2),transparent)" };
    case "dark-dim":
      return { containerBg: "#000", imgOpacity: 0.5, gradient: "linear-gradient(to right,rgba(0,0,0,0.85),rgba(0,0,0,0.4))" };
    case "blue":
      return { containerBg: "hsl(221,100%,28%)", imgOpacity: 0.5, gradient: "linear-gradient(to right,hsl(221deg 100% 28%/.9),transparent)" };
    default:
      return { containerBg: "#000", imgOpacity: 1, gradient: "" };
  }
}

export default function HeroSlider({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);

  // Reset sub-image when banner changes
  useEffect(() => { setImgIdx(0); }, [idx]);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) {
    return (
      <div className="relative flex h-[260px] items-center overflow-hidden rounded-2xl bg-primary xs:h-[300px] sm:h-[400px] lg:h-[480px]">
        <div className="relative z-10 max-w-2xl px-5 xs:px-8 sm:px-12">
          <div className="mb-2.5 inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-medium leading-none text-white xs:mb-4 xs:px-4 xs:py-1.5 xs:text-sm">
            Системы безопасности
          </div>
          <h1 className="text-xl font-black leading-[1.15] text-white xs:text-2xl xs:leading-tight sm:text-4xl lg:text-5xl">
            Видеонаблюдение<br />и IP-камеры
          </h1>
          <p className="mt-2 text-xs leading-snug text-white/80 xs:mt-4 xs:text-sm sm:text-lg sm:leading-normal">
            846 товаров от ведущих производителей. Установка под ключ.
          </p>
          <Link
            href="/catalog"
            className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-primary transition-transform hover:scale-105 xs:mt-6 xs:px-6 xs:py-3 xs:text-sm"
          >
            Перейти в каталог <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 75% 50%, white 0%, transparent 60%)" }} />
      </div>
    );
  }

  const b = banners[idx];
  const imgs = parseImages(b.image);
  const currentImg = imgs[Math.min(imgIdx, imgs.length - 1)] ?? "";
  const overlay = getOverlay(b.overlayStyle);

  return (
    <div className="relative h-[260px] overflow-hidden rounded-2xl xs:h-[300px] sm:h-[400px] lg:h-[480px]"
      style={{ background: overlay.containerBg }}>
      {currentImg && (
        <Image src={currentImg} alt={b.title} fill className="object-cover transition-opacity duration-300"
          style={{ opacity: overlay.imgOpacity }} unoptimized priority={idx === 0} />
      )}
      {overlay.gradient && (
        <div className="absolute inset-0" style={{ background: overlay.gradient }} />
      )}
      <div className="relative z-10 flex h-full max-w-2xl flex-col justify-center px-5 xs:px-8 sm:px-12">
        {idx === 0
          ? <h1 className="text-xl font-black leading-[1.15] text-white xs:text-2xl xs:leading-tight sm:text-4xl lg:text-5xl">{b.title}</h1>
          : <h2 className="text-xl font-black leading-[1.15] text-white xs:text-2xl xs:leading-tight sm:text-4xl lg:text-5xl">{b.title}</h2>}
        {b.subtitle && <p className="mt-2 text-xs leading-snug text-white/80 xs:mt-4 xs:text-sm sm:text-lg sm:leading-normal">{b.subtitle}</p>}
        {b.buttonText && b.buttonUrl && (
          <Link href={b.buttonUrl} className="mt-3.5 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-primary hover:scale-105 transition-transform xs:mt-6 xs:px-6 xs:py-3 xs:text-sm">
            {b.buttonText} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Thumbnails strip — visible only when this banner has multiple images */}
      {imgs.length > 1 && (
        <div className="absolute bottom-4 right-14 z-20 flex gap-1.5">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setImgIdx(i)}
              className={`relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === imgIdx ? "border-white shadow-lg scale-105" : "border-white/30 opacity-50 hover:opacity-90"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}

      {banners.length > 1 && (
        <>
          <button onClick={() => setIdx((i) => (i - 1 + banners.length) % banners.length)}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => setIdx((i) => (i + 1) % banners.length)}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
