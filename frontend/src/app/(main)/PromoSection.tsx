"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Wifi, Camera, Tag } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function PromoSection() {
  const s = useSiteSettings();

  const promoItems = [
    {
      gradient: "linear-gradient(135deg,#0057B8,#0077e6)",
      icon: "wifi",
      label: "АКЦИЯ",
      title: "Wi-Fi камеры EZVIZ",
      subtitle: "Без прокладки кабеля · с установкой",
      imgs: [
        s["promo_ezviz_0"] || "https://emin.kg/files/9b29d4867b37401aae450b8c46fbb829",
        s["promo_ezviz_1"] || "https://emin.kg/files/9108eb5fc94d46f99b18d5f79aed7f2e",
        s["promo_ezviz_2"] || "https://emin.kg/files/1153f9859209440296d7b7c12a59aa33",
        s["promo_ezviz_3"] || "",
      ],
      price: "от 2 350 сом",
    },
    {
      gradient: "linear-gradient(135deg,#003d8f,#0057B8)",
      icon: "camera",
      label: "АКЦИЯ",
      title: "Видеонаблюдение под ключ",
      subtitle: "4МР · TVT · NVR + PoE · 4 камеры",
      imgs: [
        s["promo_tvt_0"] || "",
        s["promo_tvt_1"] || "",
      ],
      price: "от 21 900 сом",
    },
  ];

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-extrabold sm:text-2xl">Акции</h2>
        </div>
        <Link href="/aktsii" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Все акции <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {promoItems.map((item) => (
          <Link key={item.title} href="/aktsii"
            className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md"
            style={{ borderColor: "hsl(var(--border))" }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: item.gradient }}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                {item.icon === "wifi"
                  ? <Wifi className="h-5 w-5 text-white" />
                  : <Camera className="h-5 w-5 text-white" />}
              </div>
              <div>
                <span className="mb-0.5 inline-block rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                  {item.label}
                </span>
                <p className="text-sm font-bold leading-tight text-white">{item.title}</p>
                <p className="text-[11px] text-white/70">{item.subtitle}</p>
              </div>
            </div>
            {/* Images row */}
            <div className="flex gap-2 px-4 py-3">
              {item.imgs.map((src, i) => (
                <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl bg-secondary shrink-0 flex items-center justify-center">
                  {src
                    ? <Image src={src} alt={item.title} fill className="object-contain p-1" unoptimized />
                    : <Camera className="h-7 w-7 text-muted-foreground/30" />}
                </div>
              ))}
            </div>
            {/* Price */}
            <div className="flex items-center justify-between border-t px-4 py-3" style={{ borderColor: "hsl(var(--border))" }}>
              <span className="text-sm font-black text-primary">{item.price}</span>
              <span className="flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                Подробнее <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
