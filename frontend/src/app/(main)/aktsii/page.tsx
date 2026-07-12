"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, CheckCircle, Tag, Wifi, Camera, ShoppingCart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { getSettings } from "@/lib/api";
import { parsePromoCameras } from "@/lib/settings";
import { EZVIZ_CAMERAS_DEFAULT, TVT_CAMERAS_DEFAULT } from "@/lib/promo-defaults";

const TVT_PACKAGES = [
  { label: "Комплект с HDD 500 ГБ", note: "Запись до 5 дней", price: 21900 },
  { label: "Комплект с HDD 1 ТБ", note: "Запись до 1 недели", price: 24900 },
];

const TVT_FEATURES = [
  "4 камеры морозостойкие и влагозащищённые",
  "Со звуком и цветной подсветкой",
  "NVR 4-канальный с POE",
  "Кабель 50 метров в комплекте",
  "Все аксессуары включены",
  "Установка и настройка под ключ",
];

const INCLUDED = [
  "Флеш карта 64 ГБ", "10 дней записи",
  "Установка под ключ", "Расходные материалы",
  "Настройка приложения", "Гарантия 1 год",
];

function CTA({ guarantee }: { guarantee: string }) {
  return (
    <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center" style={{ borderColor: "hsl(var(--border))" }}>
      <div className="flex flex-1 items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
          <Star className="h-4 w-4 text-white" />
        </div>
        <p className="text-xs font-semibold">{guarantee}</p>
      </div>
      <div className="flex w-full gap-2 sm:w-auto">
        <a href="tel:+996704443333"
          className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#003d8f,#0077e6)" }}>
          <Phone className="h-4 w-4" /> Позвонить
        </a>
        <a href="https://wa.me/996704443333" target="_blank" rel="noopener noreferrer"
          className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 py-2.5 text-sm font-bold text-green-700 hover:bg-green-100">
          <ShoppingCart className="h-4 w-4" /> WhatsApp
        </a>
      </div>
    </div>
  );
}

export default function AktsiiPage() {
  const [EZVIZ_CAMERAS, setEzvizCameras] = useState(EZVIZ_CAMERAS_DEFAULT);
  const [TVT_CAMERAS, setTvtCameras] = useState(TVT_CAMERAS_DEFAULT);

  useEffect(() => {
    getSettings().then((s) => {
      setEzvizCameras(parsePromoCameras(s.promo_ezviz_cameras, EZVIZ_CAMERAS_DEFAULT));
      setTvtCameras(parsePromoCameras(s.promo_tvt_cameras, TVT_CAMERAS_DEFAULT));
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen py-8" style={{ background: "hsl(var(--secondary)/.3)" }}>
      <div className="max-w-5xl mx-auto px-4 space-y-8">

        {/* Заголовок */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-extrabold">Акции и спецпредложения</h1>
          </div>
          <p className="text-sm text-muted-foreground">Выгодные комплекты с установкой под ключ</p>
        </div>

        {/* АКЦИЯ 1: Wi-Fi камеры EZVIZ */}
        <div className="rounded-3xl overflow-hidden border bg-white shadow-sm" style={{ borderColor: "hsl(var(--border))" }}>
          <div className="flex items-center gap-4 px-6 py-5"
            style={{ background: "linear-gradient(135deg,#0057B8,#0077e6)" }}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <Wifi className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="mb-1 inline-block rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                АКЦИЯ
              </span>
              <h2 className="text-lg font-bold leading-tight text-white">Wi-Fi камеры EZVIZ</h2>
              <p className="text-xs text-white/70">С установкой и записью · без прокладки кабеля</p>
            </div>
          </div>

          <div className="p-6">
            {/* Карточки камер */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {EZVIZ_CAMERAS.map((cam) => {
                const inner = (
                  <>
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary flex items-center justify-center">
                      {cam.image
                        ? <Image src={cam.image} alt={cam.name} fill className="object-contain p-1" unoptimized />
                        : <Wifi className="h-8 w-8 text-muted-foreground/30" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm transition-colors group-hover:text-primary">{cam.name}</p>
                      <p className="mb-2 text-xs text-muted-foreground">{cam.type}</p>
                      <ul className="mb-2 space-y-0.5">
                        {cam.specs.map((s) => (
                          <li key={s} className="flex items-center gap-1 text-xs text-foreground/70">
                            <CheckCircle className="h-3 w-3 shrink-0 text-green-500" /> {s}
                          </li>
                        ))}
                      </ul>
                      {!!cam.price && cam.price > 0 && (
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-primary">{cam.price.toLocaleString("ru")}</span>
                          <span className="text-xs text-muted-foreground">сом</span>
                        </div>
                      )}
                    </div>
                  </>
                );
                return cam.slug
                  ? <Link key={cam.name} href={`/product/${cam.slug}`}
                      className="group flex gap-4 rounded-2xl border p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                      style={{ borderColor: "hsl(var(--border))" }}>{inner}</Link>
                  : <div key={cam.name}
                      className="group flex gap-4 rounded-2xl border p-4"
                      style={{ borderColor: "hsl(var(--border))" }}>{inner}</div>;
              })}
            </div>

            {/* Что входит */}
            <div className="mb-5 rounded-xl border border-primary/10 bg-primary/5 p-4">
              <p className="mb-2 text-sm font-semibold text-primary">В комплекте с камерой:</p>
              <div className="grid grid-cols-2 gap-1">
                {INCLUDED.map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-foreground/80">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-500" /> {f}
                  </div>
                ))}
              </div>
            </div>

            <CTA guarantee="1 ГОД гарантии на камеры и работы" />
          </div>
        </div>

        {/* АКЦИЯ 2: Комплект TVT под ключ */}
        <div className="rounded-3xl overflow-hidden border bg-white shadow-sm" style={{ borderColor: "hsl(var(--border))" }}>
          <div className="flex items-center gap-4 px-6 py-5"
            style={{ background: "linear-gradient(135deg,#003d8f,#0057B8)" }}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="mb-1 inline-block rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                АКЦИЯ
              </span>
              <h2 className="text-lg font-bold leading-tight text-white">Видеонаблюдение под ключ</h2>
              <p className="text-xs text-white/70">4МР качество · TVT · NVR + PoE · 4 камеры</p>
            </div>
          </div>

          <div className="p-6">
            {/* Фото камер */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              {TVT_CAMERAS.map((cam) => (
                <div key={cam.name} className="rounded-2xl border p-4 text-center" style={{ borderColor: "hsl(var(--border))" }}>
                  <div className="relative mx-auto mb-3 h-28 w-28 overflow-hidden rounded-xl bg-secondary flex items-center justify-center">
                    {cam.image
                      ? <Image src={cam.image} alt={cam.name} fill className="object-contain p-2" unoptimized />
                      : <Camera className="h-10 w-10 text-muted-foreground/40" />}
                  </div>
                  <p className="font-bold text-sm">{cam.name}</p>
                  <p className="mb-2 text-xs text-muted-foreground">{cam.type}</p>
                  <ul className="inline-block space-y-0.5 text-left">
                    {cam.specs.map((s) => (
                      <li key={s} className="flex items-center gap-1 text-xs text-foreground/70">
                        <CheckCircle className="h-3 w-3 shrink-0 text-green-500" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Пакеты */}
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {TVT_PACKAGES.map((pkg) => (
                <div key={pkg.label} className="rounded-2xl p-5 text-center text-white"
                  style={{ background: "linear-gradient(135deg,#003d8f,#0077e6)" }}>
                  <p className="mb-1 text-sm font-bold">{pkg.label}</p>
                  <p className="mb-3 text-xs text-white/70">{pkg.note}</p>
                  <p className="text-4xl font-black">{pkg.price.toLocaleString("ru")}</p>
                  <p className="text-sm text-white/80">сом · с установкой</p>
                </div>
              ))}
            </div>

            {/* Включено */}
            <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {TVT_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle className="h-4 w-4 shrink-0 text-green-500" /> {f}
                </div>
              ))}
            </div>

            <CTA guarantee="2 ГОДА гарантии на камеры и работы" />
          </div>
        </div>

        {/* Контакты */}
        <div className="rounded-2xl p-6 text-center"
          style={{ background: "linear-gradient(135deg,#003d8f,#0077e6)" }}>
          <p className="text-lg font-bold text-white mb-1">Пишите или звоните!</p>
          <p className="text-sm text-white/70 mb-4">С радостью ответим на ваши вопросы</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="tel:+996704443333" className="flex items-center gap-2 font-bold text-white hover:text-yellow-300 transition-colors">
              <Phone className="h-4 w-4" /> 0704 44 33 33
            </a>
            <span className="hidden text-white/30 sm:block">|</span>
            <a href="tel:+996553413333" className="flex items-center gap-2 font-bold text-white hover:text-yellow-300 transition-colors">
              <Phone className="h-4 w-4" /> 0553 41 33 33
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
