import type { Metadata } from 'next';
import './globals.css';
import { SITE_URL, SITE_NAME } from '@/lib/seo';
import { Toaster } from '@/components/ui/toast';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — системы безопасности и цифровая техника в Бишкеке`,
    template: `%s`,
  },
  description: 'Интернет-магазин систем видеонаблюдения, IP-камер, регистраторов и цифровой техники в Бишкеке и по Кыргызстану.',
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  areaServed: 'KG',
  address: { '@type': 'PostalAddress', addressLocality: 'Бишкек', addressCountry: 'KG' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c') }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
