"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { getSettings, adminUpdateSettings } from "@/lib/api";

const FIELDS: { key: string; label: string; type?: string; placeholder?: string }[] = [
  { key: "siteName",       label: "Название сайта",     placeholder: "TECHNICS" },
  { key: "sitePhone",      label: "Телефон",            placeholder: "+996 XXX XXX XXX" },
  { key: "siteEmail",      label: "Email",              placeholder: "info@example.com" },
  { key: "siteAddress",    label: "Адрес",              placeholder: "г. Бишкек, ул. ..." },
  { key: "siteWorkHours",  label: "Режим работы",       placeholder: "Пн–Пт 9:00–18:00" },
  { key: "siteWhatsapp",   label: "WhatsApp",           placeholder: "+996..." },
  { key: "siteTelegram",   label: "Telegram",           placeholder: "@username" },
  { key: "siteInstagram",  label: "Instagram",          placeholder: "@username" },
  { key: "freeDeliveryFrom",label: "Бесплатная доставка от (сом)", type: "number", placeholder: "50000" },
  { key: "deliveryCost",   label: "Стоимость доставки (сом)", type: "number", placeholder: "300" },
  { key: "metaTitle",      label: "SEO: Title",         placeholder: "TECHNICS — системы безопасности" },
  { key: "metaDescription",label: "SEO: Description",   placeholder: "Купить камеры видеонаблюдения..." },
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "ADMIN") { router.push("/"); return; }
    getSettings().then((s) => { setSettings(s); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminUpdateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Настройки сайта</h1>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Сохраняем..." : saved ? "Сохранено ✓" : "Сохранить"}
        </button>
      </div>

      {saved && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">
          Настройки успешно сохранены!
        </div>
      )}

      <div className="rounded-xl border bg-white p-6 space-y-5" style={{ borderColor: "hsl(var(--border))" }}>
        {FIELDS.map(({ key, label, type = "text", placeholder }) => (
          <div key={key}>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
            <input
              type={type}
              value={settings[key] ?? ""}
              onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
              placeholder={placeholder}
              className="h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              style={{ borderColor: "hsl(var(--border))" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
