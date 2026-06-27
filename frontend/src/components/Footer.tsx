'use client';
import { Phone, MapPin, Clock } from 'lucide-react';

const TgIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.14 13.928l-2.98-.924c-.648-.204-.66-.648.136-.961l11.647-4.49c.537-.194 1.006.131.95.668z"/>
  </svg>
);
const WaIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer id="contacts" className="bg-white border-t border-gray-100 mt-8">
      {/* Bottom info */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #003d8f, #0077e6)' }}
            >
              T
            </div>
            <span className="font-bold text-gray-800" style={{ color: '#0057B8' }}>TECHNICS</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Интернет-магазин электроники и оборудования безопасности в Бишкеке
          </p>
          <div className="flex items-center gap-2 mt-4">
            <a
              href="https://t.me/technicskg"
              target="_blank" rel="noopener noreferrer"
              title="Telegram: @technicskg"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-600 transition-colors"
            >
              <TgIcon />
            </a>
            <a
              href="https://wa.me/996704443333"
              target="_blank" rel="noopener noreferrer"
              title="WhatsApp: 0704 44 33 33"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
            >
              <WaIcon />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-3 text-sm">Покупателям</h4>
          <ul className="space-y-2">
            {['Доставка и оплата', 'Гарантия', 'Возврат товара', 'Кредит'].map((item) => (
              <li key={item}>
                <a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-3 text-sm">О компании</h4>
          <ul className="space-y-2">
            {['О нас', 'Новости', 'Вакансии', 'Контакты'].map((item) => (
              <li key={item}>
                <a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-3 text-sm">Контакты</h4>
          <ul className="space-y-2.5">
            <li className="flex items-center gap-2">
              <Phone size={13} className="text-blue-500 flex-shrink-0" />
              <a href="tel:+996704443333" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">0704 44 33 33</a>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={13} className="text-blue-500 flex-shrink-0" />
              <a href="tel:+996553413333" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">0553 41 33 33</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-gray-500">г. Бишкек, ул. Токолдош 3а</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock size={13} className="text-blue-500 flex-shrink-0" />
              <span className="text-xs text-gray-500">Пн–Вс: 9:00–20:00</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © 2026 TECHNICS. Все права защищены.
      </div>
    </footer>
  );
}
