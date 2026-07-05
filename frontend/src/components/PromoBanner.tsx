'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function PromoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('promo-dismissed');
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('promo-dismissed', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-white">
      <div
        className="relative flex items-center gap-2 py-2 text-white text-xs font-medium max-w-7xl mx-auto px-4 rounded-b-xl overflow-hidden"
        style={{ background: 'linear-gradient(90deg, #003d8f 0%, #0057B8 50%, #003d8f 100%)' }}
      >
        <div className="overflow-hidden w-full">
          <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
            {[
              '🚚 Бесплатная доставка по Бишкеку от 5 000 сом',
              '✅ Официальная гарантия на все товары',
              '📞 Звонки и WhatsApp: 0704 44 33 33',
              '🏪 Самовывоз: ул. Токолдош 3а',
              '💳 Рассрочка и кредит без переплат',
              '🔒 Безопасная оплата онлайн',
            ].map((text, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 flex-shrink-0">{text}</span>
            ))}
            {[
              '🚚 Бесплатная доставка по Бишкеку от 5 000 сом',
              '✅ Официальная гарантия на все товары',
              '📞 Звонки и WhatsApp: 0704 44 33 33',
              '🏪 Самовывоз: ул. Токолдош 3а',
              '💳 Рассрочка и кредит без переплат',
              '🔒 Безопасная оплата онлайн',
            ].map((text, i) => (
              <span key={`d-${i}`} className="inline-flex items-center gap-1.5 flex-shrink-0">{text}</span>
            ))}
          </div>
        </div>

        <button
          onClick={dismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
          aria-label="Закрыть"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
