import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import PromoBanner from '@/components/PromoBanner';
import ToastContainer from '@/components/Toast';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PromoBanner />
      <Header />
      <CartDrawer />
      <ToastContainer />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
