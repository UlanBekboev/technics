import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { getSettings } from "@/lib/api";
import { parseList } from "@/lib/settings";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";
import { ContactsForm } from "./ContactsForm";

export const revalidate = 300;

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export async function generateMetadata(): Promise<Metadata> {
  const title = `Контакты | ${SITE_NAME}`;
  const description = "Телефоны, адреса и режим работы TECHNICS в Бишкеке. Свяжитесь с нами удобным способом.";
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl("/contacts") },
    openGraph: { title, description, url: absoluteUrl("/contacts"), siteName: SITE_NAME, type: "website", locale: "ru_RU" },
  };
}

export default async function ContactsPage() {
  const settings = await getSettings().catch(() => ({}) as Record<string, string>);

  const phones = parseList(settings.sitePhones);
  if (settings.sitePhone && !phones.includes(settings.sitePhone)) phones.unshift(settings.sitePhone);
  const addresses = parseList(settings.siteAddresses);
  if (settings.siteAddress && !addresses.includes(settings.siteAddress)) addresses.unshift(settings.siteAddress);

  const mapAddress = addresses.map((a) => a?.trim()).find((a) => a && a.length >= 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumbs items={[{ label: "Контакты" }]} />
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Контакты</h1>
      <p className="mt-1 text-muted-foreground">Свяжитесь с нами удобным способом</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {phones.length > 0 && (
            <ContactCard icon={<Phone className="h-5 w-5" />} title="Телефоны">
              <span className="flex flex-col gap-1">
                {phones.map((p) => (
                  <a key={p} href={telHref(p)} className="hover:text-primary">{p}</a>
                ))}
              </span>
            </ContactCard>
          )}
          {settings.siteEmail && (
            <ContactCard icon={<Mail className="h-5 w-5" />} title="E-mail">
              <a href={`mailto:${settings.siteEmail}`} className="hover:text-primary">{settings.siteEmail}</a>
            </ContactCard>
          )}
          {addresses.length > 0 && (
            <ContactCard icon={<MapPin className="h-5 w-5" />} title="Адреса">
              <span className="flex flex-col gap-1">
                {addresses.map((a) => <span key={a}>{a}</span>)}
              </span>
            </ContactCard>
          )}
          {settings.siteWorkHours && (
            <ContactCard icon={<Clock className="h-5 w-5" />} title="Режим работы">
              {settings.siteWorkHours}
            </ContactCard>
          )}

          <div className="flex flex-wrap gap-3">
            {settings.siteWhatsapp && (
              <a
                href={settings.siteWhatsapp} target="_blank" rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-success py-3 text-sm font-semibold text-success-foreground transition-opacity hover:opacity-90"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </a>
            )}
            {settings.siteTelegram && (
              <a
                href={settings.siteTelegram} target="_blank" rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Send className="h-5 w-5" />
                Telegram
              </a>
            )}
            {settings.siteInstagram && (
              <a
                href={settings.siteInstagram} target="_blank" rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <InstagramIcon className="h-5 w-5" />
                Instagram
              </a>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <ContactsForm />

          {mapAddress && (
            <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
              <iframe
                title={`Карта — ${settings.siteName || SITE_NAME}, ${mapAddress}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`}
                className="h-64 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// lucide-react in this project doesn't ship brand icons — inline the Instagram glyph.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function ContactCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
