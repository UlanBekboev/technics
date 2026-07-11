import type { Metadata } from "next";
import { Target, Award, Users, Building2, Truck, ShieldCheck, BadgeCheck, Headset } from "lucide-react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { getSettings, getBrands } from "@/lib/api";
import { parseStats } from "@/lib/settings";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";
import type { Brand } from "@/types";

export const revalidate = 300;

const ADVANTAGES = [
  { icon: Truck, title: "Быстрая доставка", text: "По Бишкеку — в день заказа, в регионы — транспортными компаниями." },
  { icon: ShieldCheck, title: "Гарантия качества", text: "Официальная гарантия производителя на всю продукцию." },
  { icon: BadgeCheck, title: "Официальные товары", text: "Работаем напрямую с поставщиками — только оригинал." },
  { icon: Headset, title: "Поддержка", text: "Консультируем по выбору, настройке и монтажу оборудования." },
];

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings().catch(() => ({}) as Record<string, string>);
  const title = `${s.aboutTitle || `О компании ${SITE_NAME}`} | ${SITE_NAME}`;
  const description = s.aboutSubtitle || "Поставщик систем видеонаблюдения, охранных сигнализаций и цифровой техники в Кыргызстане.";
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl("/about") },
    openGraph: { title, description, url: absoluteUrl("/about"), siteName: SITE_NAME, type: "website", locale: "ru_RU" },
  };
}

export default async function AboutPage() {
  const [settings, brands]: [Record<string, string>, Brand[]] = await Promise.all([
    getSettings().catch(() => ({}) as Record<string, string>),
    getBrands().catch((): Brand[] => []),
  ]);

  const stats = parseStats(settings.aboutStats);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumbs items={[{ label: "О компании" }]} />

      <section className="relative mt-4 overflow-hidden rounded-2xl bg-primary p-8 text-white sm:p-12">
        <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
          {settings.aboutTitle || `О компании ${SITE_NAME}`}
        </h1>
        {settings.aboutSubtitle && (
          <p className="mt-3 max-w-2xl whitespace-pre-line text-white/90">{settings.aboutSubtitle}</p>
        )}
      </section>

      {stats.length > 0 && (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <p className="text-3xl font-extrabold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </section>
      )}

      {(settings.aboutHistory || settings.aboutMission) && (
        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          {settings.aboutHistory && (
            <article className="rounded-2xl border border-border bg-card p-7 shadow-sm">
              <Building2 className="h-9 w-9 text-primary" />
              <h2 className="mt-4 text-xl font-bold">История компании</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {settings.aboutHistory}
              </p>
            </article>
          )}
          {settings.aboutMission && (
            <article className="rounded-2xl border border-border bg-card p-7 shadow-sm">
              <Target className="h-9 w-9 text-primary" />
              <h2 className="mt-4 text-xl font-bold">Наша миссия</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {settings.aboutMission}
              </p>
            </article>
          )}
        </section>
      )}

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Award className="h-6 w-6 text-primary" />
          Наши преимущества
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ADVANTAGES.map((a) => (
            <div key={a.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <a.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-3 text-base font-bold">{a.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      {brands.length > 0 && (
        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Users className="h-6 w-6 text-primary" />
            Партнёры
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {brands.map((b) => (
              <div
                key={b.id}
                className="flex h-20 items-center justify-center rounded-2xl border border-border bg-card px-2 text-center text-lg font-bold text-muted-foreground shadow-sm"
              >
                {b.name}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
