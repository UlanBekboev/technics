"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const LINKS = {
  catalog: [
    { label: "IP Камеры", href: "/catalog?category=ip-kamery-dahua" },
    { label: "NVR/DVR регистраторы", href: "/catalog?category=nvr-tvt" },
    { label: "Wi-Fi Роутеры", href: "/catalog?category=wi-fi-routery" },
    { label: "Домофония", href: "/catalog?category=domofonija" },
    { label: "Все категории", href: "/catalog" },
  ],
  info: [
    { label: "О компании", href: "/about" },
    { label: "Контакты", href: "/contacts" },
    { label: "Условия доставки", href: "/contacts" },
  ],
};

export function Footer() {
  const s = useSiteSettings();

  const phone = s.sitePhone || "+996 312 900 000";
  const email = s.siteEmail || "info@technics.kg";
  const address = s.siteAddress || "г. Бишкек";
  const phoneHref = "tel:" + phone.replace(/\s/g, "");

  return (
    <footer className="border-t bg-foreground text-white" style={{ borderColor: "hsl(var(--border))" }}>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground text-base font-black">T</div>
              <span className="text-xl font-black tracking-tight">TECHNICS</span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              Системы безопасности и цифровая техника в Бишкеке. Профессиональная консультация и установка.
            </p>
          </div>

          {/* Catalog */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>Каталог</h3>
            <ul className="space-y-2">
              {LINKS.catalog.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors hover:text-primary-foreground" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>Информация</h3>
            <ul className="space-y-2">
              {LINKS.info.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors hover:text-primary-foreground" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>Контакты</h3>
            <ul className="space-y-3">
              <li>
                <a href={phoneHref} className="flex items-start gap-2.5 text-sm hover:text-primary transition-colors" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                  {phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="flex items-start gap-2.5 text-sm hover:text-primary transition-colors" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                  {email}
                </a>
              </li>
              <li>
                <span className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {address}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            © {new Date().getFullYear()} TECHNICS. Все права защищены.
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Бишкек, Кыргызстан
          </p>
        </div>
      </div>
    </footer>
  );
}
