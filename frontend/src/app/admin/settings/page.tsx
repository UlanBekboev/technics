"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { getSettings, adminUpdateSettings } from "@/lib/api";
import { parseList, parseStats, type AboutStat } from "@/lib/settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GENERAL_FIELDS: { key: string; label: string; type?: string; placeholder?: string }[] = [
  { key: "siteName",       label: "Название сайта",     placeholder: "TECHNICS" },
  { key: "sitePhone",      label: "Телефон (основной — в шапке и подвале)", placeholder: "+996 XXX XXX XXX" },
  { key: "siteEmail",      label: "Email",              placeholder: "info@example.com" },
  { key: "siteAddress",    label: "Адрес (основной — в шапке и подвале)", placeholder: "г. Бишкек, ул. ..." },
  { key: "siteWorkHours",  label: "Режим работы",       placeholder: "Пн–Пт 9:00–18:00" },
  { key: "siteWhatsapp",   label: "WhatsApp (ссылка)",  placeholder: "https://api.whatsapp.com/send?phone=996700000000" },
  { key: "siteTelegram",   label: "Telegram (ссылка)",  placeholder: "https://t.me/username" },
  { key: "siteInstagram",  label: "Instagram (ссылка)", placeholder: "https://instagram.com/username" },
  { key: "freeDeliveryFrom",label: "Бесплатная доставка от (сом)", type: "number", placeholder: "50000" },
  { key: "deliveryCost",   label: "Стоимость доставки (сом)", type: "number", placeholder: "300" },
  { key: "metaTitle",      label: "SEO: Title",         placeholder: "TECHNICS — системы безопасности" },
  { key: "metaDescription",label: "SEO: Description",   placeholder: "Купить камеры видеонаблюдения..." },
];

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [phones, setPhones] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [stats, setStats] = useState<AboutStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Auth/role redirect is handled by admin/layout.tsx (it waits for the
    // auth store to rehydrate first — redirecting here too raced it and
    // bounced admins straight back to /login on a fresh page load).
    if (!user || user.role !== "ADMIN") return;
    getSettings().then((s) => {
      setSettings(s);
      setPhones(parseList(s.sitePhones));
      setAddresses(parseList(s.siteAddresses));
      setStats(parseStats(s.aboutStats));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const set = (key: string, value: string) => setSettings((s) => ({ ...s, [key]: value }));

  const setListItem = (list: string[], setList: (v: string[]) => void, i: number, value: string) =>
    setList(list.map((v, idx) => (idx === i ? value : v)));
  const addListItem = (list: string[], setList: (v: string[]) => void) => setList([...list, ""]);
  const removeListItem = (list: string[], setList: (v: string[]) => void, i: number) =>
    setList(list.filter((_, idx) => idx !== i));

  const setStat = (i: number, key: keyof AboutStat, value: string) =>
    setStats((prev) => prev.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)));
  const addStat = () => setStats((prev) => [...prev, { value: "", label: "" }]);
  const removeStat = (i: number) => setStats((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        sitePhones: JSON.stringify(phones.map((p) => p.trim()).filter(Boolean)),
        siteAddresses: JSON.stringify(addresses.map((a) => a.trim()).filter(Boolean)),
        aboutStats: JSON.stringify(stats.filter((s) => s.value.trim() || s.label.trim())),
      };
      await adminUpdateSettings(payload);
      setSettings(payload);
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

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Основные</TabsTrigger>
          <TabsTrigger value="about">О компании</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="rounded-xl border bg-white p-6 space-y-5" style={{ borderColor: "hsl(var(--border))" }}>
            {GENERAL_FIELDS.map(({ key, label, type = "text", placeholder }) => (
              <div key={key}>
                <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
                <input
                  type={type}
                  value={settings[key] ?? ""}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                  className="h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  style={{ borderColor: "hsl(var(--border))" }}
                />
              </div>
            ))}
          </div>

          <div className="rounded-xl border bg-white p-6 space-y-5" style={{ borderColor: "hsl(var(--border))" }}>
            <p className="text-sm font-semibold text-foreground">Страница «Контакты»</p>
            <ListEditor
              label="Телефоны" addLabel="Добавить номер" placeholder="+996 700 000 000"
              items={phones}
              onChange={(i, v) => setListItem(phones, setPhones, i, v)}
              onAdd={() => addListItem(phones, setPhones)}
              onRemove={(i) => removeListItem(phones, setPhones, i)}
            />
            <ListEditor
              label="Адреса" addLabel="Добавить адрес" placeholder="г. Бишкек, ул. ..."
              items={addresses}
              onChange={(i, v) => setListItem(addresses, setAddresses, i, v)}
              onAdd={() => addListItem(addresses, setAddresses)}
              onRemove={(i) => removeListItem(addresses, setAddresses, i)}
            />
          </div>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <div className="rounded-xl border bg-white p-6 space-y-5" style={{ borderColor: "hsl(var(--border))" }}>
            <p className="text-sm font-semibold text-foreground">Баннер страницы «О компании»</p>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Заголовок</label>
              <input
                value={settings.aboutTitle ?? ""}
                onChange={(e) => set("aboutTitle", e.target.value)}
                className="h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                style={{ borderColor: "hsl(var(--border))" }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Подзаголовок</label>
              <textarea
                rows={2}
                value={settings.aboutSubtitle ?? ""}
                onChange={(e) => set("aboutSubtitle", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
                style={{ borderColor: "hsl(var(--border))" }}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6" style={{ borderColor: "hsl(var(--border))" }}>
            <p className="mb-4 text-sm font-semibold text-foreground">Цифры статистики</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {stats.map((s, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border p-3" style={{ borderColor: "hsl(var(--border))" }}>
                  <div className="flex-1 space-y-2">
                    <input
                      value={s.value} placeholder="10+"
                      onChange={(e) => setStat(i, "value", e.target.value)}
                      className="h-9 w-full rounded-lg border px-2.5 text-sm outline-none focus:border-primary"
                      style={{ borderColor: "hsl(var(--border))" }}
                    />
                    <input
                      value={s.label} placeholder="лет на рынке"
                      onChange={(e) => setStat(i, "label", e.target.value)}
                      className="h-9 w-full rounded-lg border px-2.5 text-sm outline-none focus:border-primary"
                      style={{ borderColor: "hsl(var(--border))" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStat(i)}
                    className="mt-1 shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStat}
              className="mt-3 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              <Plus className="h-3.5 w-3.5" /> Добавить показатель
            </button>
          </div>

          <div className="rounded-xl border bg-white p-6 space-y-5" style={{ borderColor: "hsl(var(--border))" }}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">История компании</label>
              <textarea
                rows={4}
                value={settings.aboutHistory ?? ""}
                onChange={(e) => set("aboutHistory", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
                style={{ borderColor: "hsl(var(--border))" }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Наша миссия</label>
              <textarea
                rows={4}
                value={settings.aboutMission ?? ""}
                onChange={(e) => set("aboutMission", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
                style={{ borderColor: "hsl(var(--border))" }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ListEditor({
  label, addLabel, placeholder, items, onChange, onAdd, onRemove,
}: {
  label: string;
  addLabel: string;
  placeholder?: string;
  items: string[];
  onChange: (i: number, value: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">Пока пусто — добавьте первый.</p>
        )}
        {items.map((value, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={value}
              placeholder={placeholder}
              onChange={(e) => onChange(i, e.target.value)}
              className="h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              style={{ borderColor: "hsl(var(--border))" }}
            />
            <button
              type="button"
              aria-label="Удалить"
              onClick={() => onRemove(i)}
              className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </button>
    </div>
  );
}
