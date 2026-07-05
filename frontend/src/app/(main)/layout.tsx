import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SiteSettingsProvider } from '@/context/SiteSettingsContext';
import { ChatWidget } from '@/components/ChatWidget';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteSettingsProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </div>
    </SiteSettingsProvider>
  );
}
