import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TECHNICS — системы безопасности и цифровая техника в Бишкеке',
  description: 'Интернет-магазин систем видеонаблюдения, IP-камер, регистраторов и цифровой техники в Бишкеке и по Кыргызстану.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
