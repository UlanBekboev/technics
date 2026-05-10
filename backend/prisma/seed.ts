import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: 'postgresql://postgres:yandexpraktikum@localhost:5432/technics' });
const prisma = new PrismaClient({ adapter } as any);

const CATEGORIES: { name: string; slug: string; subs?: { name: string; slug: string }[] }[] = [
  {
    name: 'Видеорегистраторы', slug: 'videoregistratory',
    subs: [
      { name: 'NVR Emin', slug: 'nvr-emin' },
      { name: 'NVR Dahua', slug: 'nvr-dahua' },
      { name: 'NVR Hikvision, Hiwatch', slug: 'nvr-hikvision-hiwatch' },
      { name: 'XVR Dahua', slug: 'xvr-dahua' },
      { name: 'HD-TVI Hikvision, Hiwatch', slug: 'hd-tvi-hikvision-hiwatch' },
      { name: 'NVR TVT', slug: 'nvr-tvt' },
      { name: 'DVR TVT', slug: 'dvr-tvt' },
      { name: 'NVR TIANDY', slug: 'nvr-tiandy' },
    ],
  },
  {
    name: 'Видеокамеры', slug: 'videokamery',
    subs: [
      { name: 'IP Камеры Dahua', slug: 'ip-kamery-dahua' },
      { name: 'IP Камеры Hikvision', slug: 'ip-kamery-hikvision' },
      { name: 'IP Камеры EMIN', slug: 'ip-kamery-emin' },
      { name: 'CVI Камеры Dahua', slug: 'cvi-kamery-dahua' },
      { name: 'TVI Камеры Hikvision', slug: 'tvi-kamery-hikvision' },
      { name: 'WiFi Камеры', slug: 'wifi-kamery' },
      { name: 'Wi-Fi Камеры Ezviz', slug: 'wifi-kamery-ezviz' },
      { name: 'Солнечные и Симочные', slug: 'solnechnye-i-simochnye' },
      { name: 'TVI Камеры TVT', slug: 'tvi-kamery-tvt' },
      { name: 'IP Камеры TVT', slug: 'ip-kamery-tvt' },
      { name: 'WiFi Камеры Dahua', slug: 'wifi-kamery-dahua' },
    ],
  },
  {
    name: 'Кабель', slug: 'kabel',
    subs: [
      { name: 'Коаксиальный с питанием', slug: 'koaksialnyy-s-pitaniem' },
      { name: 'UTP', slug: 'utp' },
      { name: 'UTPар', slug: 'utpar' },
      { name: 'Кабель-канал', slug: 'kabel-kanal' },
      { name: 'UTP Внутренний', slug: 'utp-vnutrenniy' },
      { name: 'UTP Внутренний С Питанием', slug: 'utp-vnutrenniy-s-pitaniem' },
      { name: 'Электрический кабель', slug: 'elektricheskiy-kabel' },
    ],
  },
  {
    name: 'Прочее для Видеонаб', slug: 'prochee-dlya-videonab',
    subs: [
      { name: 'Блоки питания', slug: 'bloki-pitaniya-videonab' },
      { name: 'Аксессуары', slug: 'aksessuary-videonab' },
    ],
  },
  {
    name: 'Сигнализация и ПО', slug: 'signalizatsiya-i-po',
    subs: [
      { name: 'Приборы GSM', slug: 'pribory-gsm' },
      { name: 'Приборы', slug: 'pribory' },
      { name: 'Датчик разбития', slug: 'datchik-razbitiya' },
      { name: 'Датчик движения', slug: 'datchik-dvizheniya' },
      { name: 'Датчик размыкания', slug: 'datchik-razmykaniya' },
      { name: 'Датчик дыма', slug: 'datchik-dyma' },
      { name: 'Извещатель пожарный ручной', slug: 'izveshchatel-pozharnyy' },
      { name: 'Датчик тепловой', slug: 'datchik-teplovoy' },
      { name: 'Оповещатели свето-звуковые', slug: 'opoveshchateli-sveto-zvukovye' },
      { name: 'Считыватели', slug: 'schityvateli' },
      { name: 'Умный дом', slug: 'umnyy-dom' },
      { name: 'ББП', slug: 'bbp' },
      { name: 'AX PRO', slug: 'ax-pro' },
    ],
  },
  {
    name: 'Домофония', slug: 'domofoniya',
    subs: [
      { name: 'Многоабонентный домофон', slug: 'mnogoabonentnyy-domofon' },
      { name: 'Комплект аналогового домофона', slug: 'komplekt-analogovogo-domofona' },
      { name: 'Комплект IP домофона', slug: 'komplekt-ip-domofona' },
      { name: 'Абонентские устройства', slug: 'abonentskie-ustroystva' },
      { name: 'Вызывная панель', slug: 'vyzyvnaya-panel' },
      { name: 'Аудиодомофоны', slug: 'audiodomofony' },
      { name: 'Аксессуары', slug: 'aksessuary-domofoniya' },
      { name: 'Дверной звонок', slug: 'dvernoy-zvonok' },
    ],
  },
  { name: 'Контроль доступа', slug: 'kontrol-dostupa', subs: [] },
  { name: 'Сетевые устройства', slug: 'setevye-ustroystva', subs: [] },
  { name: 'Носители информации', slug: 'nositeli-informatsii', subs: [] },
  {
    name: 'Ноутбуки, Моноблоки', slug: 'noutbuki-monobloki',
    subs: [
      { name: 'Asus', slug: 'noutbuki-asus' },
      { name: 'Acer', slug: 'noutbuki-acer' },
      { name: 'Lenovo', slug: 'noutbuki-lenovo' },
      { name: 'Dell', slug: 'noutbuki-dell' },
      { name: 'Моноблоки', slug: 'monobloki' },
      { name: 'HP', slug: 'noutbuki-hp' },
      { name: 'MSI', slug: 'noutbuki-msi' },
    ],
  },
  {
    name: 'Мониторы', slug: 'monitory',
    subs: [
      { name: 'Imagic', slug: 'monitory-imagic' },
      { name: 'Panda', slug: 'monitory-panda' },
      { name: 'Uniview', slug: 'monitory-uniview' },
      { name: 'Dahua', slug: 'monitory-dahua' },
      { name: 'AOC', slug: 'monitory-aoc' },
      { name: 'LG', slug: 'monitory-lg' },
      { name: 'Xiaomi', slug: 'monitory-xiaomi' },
      { name: 'ASUS', slug: 'monitory-asus' },
      { name: 'BenQ', slug: 'monitory-benq' },
      { name: 'HUAWEI', slug: 'monitory-huawei' },
      { name: 'PHILIPS', slug: 'monitory-philips' },
      { name: 'SAMSUNG', slug: 'monitory-samsung' },
      { name: 'ViewSonic', slug: 'monitory-viewsonic' },
      { name: 'HIKVISION', slug: 'monitory-hikvision' },
      { name: 'Broteko', slug: 'monitory-broteko' },
      { name: 'QMAX', slug: 'monitory-qmax' },
      { name: 'MicroStar', slug: 'monitory-microstar' },
      { name: 'Acer', slug: 'monitory-acer' },
      { name: 'Emin', slug: 'monitory-emin' },
    ],
  },
  {
    name: 'Компьютеры', slug: 'kompyutery',
    subs: [
      { name: 'Комплект', slug: 'kompyutery-komplekt' },
      { name: 'Материнская плата', slug: 'materinskaya-plata' },
      { name: 'Блок питания', slug: 'blok-pitaniya-pk' },
      { name: 'Процессор', slug: 'processor' },
      { name: 'Оперативная память', slug: 'operativnaya-pamyat' },
      { name: 'Видео карта', slug: 'video-karta' },
      { name: 'Корпус', slug: 'korpus' },
      { name: 'Кулеры', slug: 'kulery' },
    ],
  },
  {
    name: 'Аксессуары для ПК', slug: 'aksessuary-dlya-pk',
    subs: [
      { name: 'Клавиатура', slug: 'klaviatura' },
      { name: 'Мышь', slug: 'mysh' },
      { name: 'Коврик', slug: 'kovrik' },
      { name: 'Колонки', slug: 'kolonki' },
      { name: 'VGA', slug: 'vga' },
      { name: 'HDMI', slug: 'hdmi' },
      { name: 'Патч корды', slug: 'patch-kordy' },
      { name: 'Силовой кабель питания', slug: 'silovoy-kabel-pitaniya' },
      { name: 'USB удлинители', slug: 'usb-udliniteli' },
      { name: 'UPS', slug: 'ups' },
      { name: 'Блок питания', slug: 'blok-pitaniya-aksessuary' },
      { name: 'Удлинители электрические', slug: 'udliniteli-elektricheskie' },
      { name: 'Вилки, тройники', slug: 'vilki-troyniki' },
      { name: 'Наушники', slug: 'naushniki' },
      { name: 'Переходники', slug: 'perekhodniki' },
      { name: 'Геймпад', slug: 'geympad' },
      { name: 'Рюкзаки и сумки для ноутбуков', slug: 'ryukzaki-i-sumki' },
      { name: 'Веб камеры', slug: 'veb-kamery' },
      { name: 'Механическая клавиатура', slug: 'mekhanicheskaya-klaviatura' },
    ],
  },
  {
    name: 'Принтеры, Проекторы', slug: 'printery-proektory',
    subs: [
      { name: 'Принтеры', slug: 'printery' },
      { name: 'МФУ', slug: 'mfu' },
      { name: 'Проекторы', slug: 'proektory' },
      { name: 'Экраны для проектора', slug: 'ekrany-dlya-proektora' },
      { name: 'Аксессуары', slug: 'aksessuary-printery' },
    ],
  },
  {
    name: 'Торговое Оборудование', slug: 'torgovoe-oborudovanie',
    subs: [
      { name: 'Принтер для чеков', slug: 'printer-dlya-chekov' },
      { name: 'Сканер штрих кодов', slug: 'skaner-shtrikh-kodov' },
      { name: 'Сервисное оборудование', slug: 'servisnoe-oborudovanie' },
      { name: 'Батарейки', slug: 'batareyki' },
      { name: 'Счетчики банкнот', slug: 'schetchiki-banknot' },
    ],
  },
  {
    name: 'Телевизоры и аудио', slug: 'televizory-i-audio',
    subs: [
      { name: 'Аксессуары и крепление ТВ', slug: 'aksessuary-kreplenie-tv' },
    ],
  },
  { name: 'Техника для дома', slug: 'tekhnika-dlya-doma', subs: [] },
  { name: 'Техника для кухни', slug: 'tekhnika-dlya-kukhni', subs: [] },
  {
    name: 'Здоровье и красота', slug: 'zdorovye-i-krasota',
    subs: [
      { name: 'Фены', slug: 'feny' },
      { name: 'Выпрямители для волос', slug: 'vypryamiteli-dlya-volos' },
      { name: 'Мультистайлеры', slug: 'multistaylery' },
      { name: 'Электробритвы', slug: 'elektrobrity' },
    ],
  },
  {
    name: 'Аксессуары', slug: 'aksessuary',
    subs: [
      { name: 'Зарядные устройства', slug: 'zaryadnye-ustroystva' },
      { name: 'Кабели и переходники', slug: 'kabeli-i-perekhodniki' },
      { name: 'Автоаксессуары', slug: 'avtoaksessuary' },
      { name: 'Аксессуары', slug: 'aksessuary-sub' },
      { name: 'Доски гладильные', slug: 'doski-gladilnye' },
      { name: 'Сушилки', slug: 'sushilki' },
      { name: 'Табуретки', slug: 'taburetki' },
    ],
  },
];

// slug: category-slug → products
const PRODUCTS: {
  categorySlug: string;
  brandName: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  stock: number;
  description?: string;
}[] = [
  // ─── NVR EMIN ───────────────────────────────────────────────────────────────
  { categorySlug: 'nvr-emin', brandName: 'EMIN', name: 'EMIN NVR-2104H (4 канала)', slug: 'emin-nvr-2104h', price: 5800, stock: 18 },
  { categorySlug: 'nvr-emin', brandName: 'EMIN', name: 'EMIN NVR-2108H-P (8 каналов, 8 PoE)', slug: 'emin-nvr-2108h-p', price: 8500, stock: 22 },
  { categorySlug: 'nvr-emin', brandName: 'EMIN', name: 'EMIN NVR-2116H (16 каналов)', slug: 'emin-nvr-2116h', price: 12500, stock: 10 },
  { categorySlug: 'nvr-emin', brandName: 'EMIN', name: 'EMIN NVR-4132H (32 канала)', slug: 'emin-nvr-4132h', price: 22000, stock: 5 },

  // ─── NVR DAHUA ──────────────────────────────────────────────────────────────
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR2104HS-P-I2 (4 кан, 4 PoE)', slug: 'dahua-nvr2104hs-p-i2', price: 7200, stock: 25 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR2104-P-I (4 кан, 4 PoE)', slug: 'dahua-nvr2104-p-i', price: 8500, stock: 20 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR2108HS-8P-I2 (8 кан, 8 PoE)', slug: 'dahua-nvr2108hs-8p-i2', price: 9800, stock: 30 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR2108H-I (8 каналов)', slug: 'dahua-nvr2108h-i', price: 8500, stock: 18 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR2108-8P-I2 (8 кан, 8 PoE)', slug: 'dahua-nvr2108-8p-i2', price: 12000, stock: 20 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR2116HS-I2 (16 каналов)', slug: 'dahua-nvr2116hs-i2', price: 14500, stock: 15 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR2116H-I2 (16 каналов)', slug: 'dahua-nvr2116h-i2', price: 16800, stock: 12 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR2116H-16P-I2 (16 кан, 16 PoE)', slug: 'dahua-nvr2116h-16p-i2', price: 22500, stock: 10 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR2132H-I2 (32 канала)', slug: 'dahua-nvr2132h-i2', price: 25000, stock: 8 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR4104HS-P-4KS3 (4 кан, 4K, 4 PoE)', slug: 'dahua-nvr4104hs-p-4ks3', price: 12000, stock: 20 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR4108HS-8P-4KS3 (8 кан, 4K, 8 PoE)', slug: 'dahua-nvr4108hs-8p-4ks3', price: 16500, stock: 15 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR4116HS-4KS3 (16 кан, 4K)', slug: 'dahua-nvr4116hs-4ks3', price: 20000, stock: 10 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR4104-P-4KS3 (4 кан, 4K, 4 PoE)', slug: 'dahua-nvr4104-p-4ks3', price: 14000, stock: 18 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR4108-8P-4KS3 (8 кан, 4K, 8 PoE)', slug: 'dahua-nvr4108-8p-4ks3', price: 20000, stock: 12 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR4116-16P-4KS3 (16 кан, 4K, 16 PoE)', slug: 'dahua-nvr4116-16p-4ks3', price: 32000, stock: 8 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR4216-16P-4KS2L (16 кан, 16 PoE, 2HDD)', slug: 'dahua-nvr4216-16p-4ks2l', price: 28000, stock: 6 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR4232-4KS2L (32 канала, 4K)', slug: 'dahua-nvr4232-4ks2l', price: 32000, stock: 5 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR5208-8P-EI (8 кан, 8 PoE, AI)', slug: 'dahua-nvr5208-8p-ei', price: 28000, stock: 8 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR5216-16P-EI (16 кан, 16 PoE, AI)', slug: 'dahua-nvr5216-16p-ei', price: 38000, stock: 5 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR5232-16P-EI (32 кан, 16 PoE, AI)', slug: 'dahua-nvr5232-16p-ei', price: 55000, stock: 3 },
  { categorySlug: 'nvr-dahua', brandName: 'Dahua', name: 'Dahua DHI-NVR5464-16P-EI (64 кан, 16 PoE, AI)', slug: 'dahua-nvr5464-16p-ei', price: 85000, stock: 2 },

  // ─── NVR HIKVISION / HIWATCH ────────────────────────────────────────────────
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7104NI-Q1/4P (4 кан, 4 PoE)', slug: 'hik-ds-7104ni-q1-4p', price: 8000, stock: 25 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7108NI-Q1/8P (8 кан, 8 PoE)', slug: 'hik-ds-7108ni-q1-8p', price: 12000, stock: 20 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7116NI-Q1/16P (16 кан, 16 PoE)', slug: 'hik-ds-7116ni-q1-16p', price: 18000, stock: 12 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7604NI-K1 (4 канала)', slug: 'hik-ds-7604ni-k1', price: 7000, stock: 18 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7608NI-K1 (8 каналов)', slug: 'hik-ds-7608ni-k1', price: 10000, stock: 20 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7608NI-K2/8P (8 кан, 8 PoE, 2HDD)', slug: 'hik-ds-7608ni-k2-8p', price: 22000, stock: 10 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7616NI-K2 (16 кан, 2HDD)', slug: 'hik-ds-7616ni-k2', price: 18000, stock: 10 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7616NI-K2/16P (16 кан, 16 PoE, 2HDD)', slug: 'hik-ds-7616ni-k2-16p', price: 32000, stock: 8 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7632NI-K2/16P (32 кан, 16 PoE, 2HDD)', slug: 'hik-ds-7632ni-k2-16p', price: 45000, stock: 4 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7732NI-K4/16P (32 кан, 16 PoE, 4HDD)', slug: 'hik-ds-7732ni-k4-16p', price: 75000, stock: 3 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7664NI-K4/16P (64 кан, 16 PoE, 4HDD)', slug: 'hik-ds-7664ni-k4-16p', price: 120000, stock: 2 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'HiWatch', name: 'HiWatch HWN-2104MH-4P (4 кан, 4 PoE)', slug: 'hiwatch-hwn-2104mh-4p', price: 7500, stock: 22 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'HiWatch', name: 'HiWatch HWN-2108MH-8P (8 кан, 8 PoE)', slug: 'hiwatch-hwn-2108mh-8p', price: 11000, stock: 18 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'HiWatch', name: 'HiWatch HWN-2116MH-16P (16 кан, 16 PoE)', slug: 'hiwatch-hwn-2116mh-16p', price: 17000, stock: 12 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'HiWatch', name: 'HiWatch HWN-4104MH-4P (4 кан, 4K, 4 PoE)', slug: 'hiwatch-hwn-4104mh-4p', price: 12000, stock: 15 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'HiWatch', name: 'HiWatch HWN-4108MH-8P (8 кан, 4K, 8 PoE)', slug: 'hiwatch-hwn-4108mh-8p', price: 18000, stock: 10 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'HiWatch', name: 'HiWatch HWN-4116MH-16P (16 кан, 4K, 16 PoE)', slug: 'hiwatch-hwn-4116mh-16p', price: 28000, stock: 6 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7104NI-K1/4P (4 кан, 4K, 4 PoE)', slug: 'hik-ds-7104ni-k1-4p', price: 9500, stock: 20 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7108NI-K1/8P (8 кан, 4K, 8 PoE)', slug: 'hik-ds-7108ni-k1-8p', price: 14000, stock: 15 },
  { categorySlug: 'nvr-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7116NI-K2/16P (16 кан, 4K, 16 PoE, 2HDD)', slug: 'hik-ds-7116ni-k2-16p', price: 25000, stock: 8 },

  // ─── XVR DAHUA ──────────────────────────────────────────────────────────────
  { categorySlug: 'xvr-dahua', brandName: 'Dahua', name: 'Dahua XVR1B04H-I (4 кан, Lite)', slug: 'dahua-xvr1b04h-i', price: 3800, stock: 30 },
  { categorySlug: 'xvr-dahua', brandName: 'Dahua', name: 'Dahua XVR4104HS-I (4 кан)', slug: 'dahua-xvr4104hs-i', price: 4500, stock: 25 },
  { categorySlug: 'xvr-dahua', brandName: 'Dahua', name: 'Dahua XVR4108HS-I (8 кан)', slug: 'dahua-xvr4108hs-i', price: 6200, stock: 22 },
  { categorySlug: 'xvr-dahua', brandName: 'Dahua', name: 'Dahua XVR4116HS-I (16 кан)', slug: 'dahua-xvr4116hs-i', price: 8800, stock: 15 },
  { categorySlug: 'xvr-dahua', brandName: 'Dahua', name: 'Dahua XVR5104HS-I3 (4 кан, 5MP)', slug: 'dahua-xvr5104hs-i3', price: 5200, stock: 28 },
  { categorySlug: 'xvr-dahua', brandName: 'Dahua', name: 'Dahua XVR5108HS-I3 (8 кан, 5MP)', slug: 'dahua-xvr5108hs-i3', price: 7200, stock: 22 },
  { categorySlug: 'xvr-dahua', brandName: 'Dahua', name: 'Dahua XVR5116HS-I3 (16 кан, 5MP)', slug: 'dahua-xvr5116hs-i3', price: 10200, stock: 15 },
  { categorySlug: 'xvr-dahua', brandName: 'Dahua', name: 'Dahua XVR5104C-I3 (4 кан, 5MP Penta-brid)', slug: 'dahua-xvr5104c-i3', price: 5500, stock: 25 },
  { categorySlug: 'xvr-dahua', brandName: 'Dahua', name: 'Dahua XVR5108C-I3 (8 кан, 5MP Penta-brid)', slug: 'dahua-xvr5108c-i3', price: 7500, stock: 20 },
  { categorySlug: 'xvr-dahua', brandName: 'Dahua', name: 'Dahua XVR5116C-I3 (16 кан, 5MP Penta-brid)', slug: 'dahua-xvr5116c-i3', price: 10500, stock: 12 },
  { categorySlug: 'xvr-dahua', brandName: 'Dahua', name: 'Dahua XVR5232AN-I3 (32 кан)', slug: 'dahua-xvr5232an-i3', price: 18500, stock: 6 },
  { categorySlug: 'xvr-dahua', brandName: 'Dahua', name: 'Dahua XVR7104HE-4K-I3 (4 кан, 4K)', slug: 'dahua-xvr7104he-4k-i3', price: 12000, stock: 15 },
  { categorySlug: 'xvr-dahua', brandName: 'Dahua', name: 'Dahua XVR7108HE-4K-I3 (8 кан, 4K)', slug: 'dahua-xvr7108he-4k-i3', price: 16500, stock: 10 },
  { categorySlug: 'xvr-dahua', brandName: 'Dahua', name: 'Dahua XVR7116HE-4K-I3 (16 кан, 4K)', slug: 'dahua-xvr7116he-4k-i3', price: 24000, stock: 6 },

  // ─── HD-TVI HIKVISION / HIWATCH ─────────────────────────────────────────────
  { categorySlug: 'hd-tvi-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7104HQHI-K1 (4 кан, TVI)', slug: 'hik-ds-7104hqhi-k1', price: 5500, stock: 25 },
  { categorySlug: 'hd-tvi-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7108HQHI-K1 (8 кан, TVI)', slug: 'hik-ds-7108hqhi-k1', price: 7500, stock: 20 },
  { categorySlug: 'hd-tvi-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7116HQHI-K2 (16 кан, TVI, 2HDD)', slug: 'hik-ds-7116hqhi-k2', price: 14000, stock: 12 },
  { categorySlug: 'hd-tvi-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7208HGHI-K2 (8 кан, TVI/CVI/AHD)', slug: 'hik-ds-7208hghi-k2', price: 9000, stock: 18 },
  { categorySlug: 'hd-tvi-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7216HGHI-K2 (16 кан, TVI/CVI/AHD)', slug: 'hik-ds-7216hghi-k2', price: 14000, stock: 12 },
  { categorySlug: 'hd-tvi-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7208HUHI-K2 (8 кан, 5MP TVI)', slug: 'hik-ds-7208huhi-k2', price: 18000, stock: 8 },
  { categorySlug: 'hd-tvi-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7216HUHI-K2 (16 кан, 5MP TVI)', slug: 'hik-ds-7216huhi-k2', price: 25000, stock: 5 },
  { categorySlug: 'hd-tvi-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7304HQHI-K4 (4 кан, AcuSense)', slug: 'hik-ds-7304hqhi-k4', price: 8000, stock: 15 },
  { categorySlug: 'hd-tvi-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7308HQHI-K4 (8 кан, AcuSense)', slug: 'hik-ds-7308hqhi-k4', price: 12000, stock: 12 },
  { categorySlug: 'hd-tvi-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7316HQHI-K4 (16 кан, AcuSense)', slug: 'hik-ds-7316hqhi-k4', price: 20000, stock: 6 },
  { categorySlug: 'hd-tvi-hikvision-hiwatch', brandName: 'Hikvision', name: 'Hikvision DS-7332HQHI-K4 (32 кан, TVI)', slug: 'hik-ds-7332hqhi-k4', price: 35000, stock: 3 },
  { categorySlug: 'hd-tvi-hikvision-hiwatch', brandName: 'HiWatch', name: 'HiWatch HWT-7104MH (4 кан, TVI)', slug: 'hiwatch-hwt-7104mh', price: 5200, stock: 20 },
  { categorySlug: 'hd-tvi-hikvision-hiwatch', brandName: 'HiWatch', name: 'HiWatch HWT-7108MH (8 кан, TVI)', slug: 'hiwatch-hwt-7108mh', price: 7800, stock: 15 },
  { categorySlug: 'hd-tvi-hikvision-hiwatch', brandName: 'HiWatch', name: 'HiWatch HWT-7116MH (16 кан, TVI)', slug: 'hiwatch-hwt-7116mh', price: 12500, stock: 10 },

  // ─── NVR TVT ────────────────────────────────────────────────────────────────
  { categorySlug: 'nvr-tvt', brandName: 'TVT', name: 'TVT TD-3304B1-4P (4 кан, 4 PoE)', slug: 'tvt-td-3304b1-4p', price: 7500, stock: 18 },
  { categorySlug: 'nvr-tvt', brandName: 'TVT', name: 'TVT TD-3308B1-8P (8 кан, 8 PoE)', slug: 'tvt-td-3308b1-8p', price: 11000, stock: 15 },
  { categorySlug: 'nvr-tvt', brandName: 'TVT', name: 'TVT TD-3308H2-8P (8 кан, 8 PoE, H.265)', slug: 'tvt-td-3308h2-8p', price: 13500, stock: 12 },
  { categorySlug: 'nvr-tvt', brandName: 'TVT', name: 'TVT TD-3316B2-16P (16 кан, 16 PoE, 2HDD)', slug: 'tvt-td-3316b2-16p', price: 18000, stock: 10 },
  { categorySlug: 'nvr-tvt', brandName: 'TVT', name: 'TVT TD-3316H2-16P (16 кан, 16 PoE, H.265)', slug: 'tvt-td-3316h2-16p', price: 22000, stock: 6 },
  { categorySlug: 'nvr-tvt', brandName: 'TVT', name: 'TVT TD-3332B2-16P (32 кан, 16 PoE)', slug: 'tvt-td-3332b2-16p', price: 28000, stock: 4 },

  // ─── DVR TVT ────────────────────────────────────────────────────────────────
  { categorySlug: 'dvr-tvt', brandName: 'TVT', name: 'TVT TD-2104TS-CL (4 кан, DVR)', slug: 'tvt-td-2104ts-cl', price: 4500, stock: 20 },
  { categorySlug: 'dvr-tvt', brandName: 'TVT', name: 'TVT TD-2108TS-CL (8 кан, DVR)', slug: 'tvt-td-2108ts-cl', price: 6500, stock: 15 },
  { categorySlug: 'dvr-tvt', brandName: 'TVT', name: 'TVT TD-2116TS-HP (16 кан, DVR)', slug: 'tvt-td-2116ts-hp', price: 10000, stock: 10 },

  // ─── NVR TIANDY ─────────────────────────────────────────────────────────────
  { categorySlug: 'nvr-tiandy', brandName: 'TIANDY', name: 'TIANDY TC-R3104 I/B (4 канала)', slug: 'tiandy-tc-r3104', price: 7000, stock: 15 },
  { categorySlug: 'nvr-tiandy', brandName: 'TIANDY', name: 'TIANDY TC-R3108 I/B (8 каналов)', slug: 'tiandy-tc-r3108', price: 10500, stock: 12 },
  { categorySlug: 'nvr-tiandy', brandName: 'TIANDY', name: 'TIANDY TC-R3116 I/B (16 каналов)', slug: 'tiandy-tc-r3116', price: 16000, stock: 8 },

  // ─── IP КАМЕРЫ DAHUA ────────────────────────────────────────────────────────
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HDW1439T1-LED (4MP Full-color Dome)', slug: 'dahua-ipc-hdw1439t1-led', price: 3200, stock: 50 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HFW1439S1-LED (4MP Full-color Bullet)', slug: 'dahua-ipc-hfw1439s1-led', price: 3400, stock: 45 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HDW1431T1-S4 (4MP IR Dome)', slug: 'dahua-ipc-hdw1431t1-s4', price: 2800, stock: 55 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HFW1439S1-LED-S4 (4MP Full-color Bullet)', slug: 'dahua-ipc-hfw1439s1-led-s4', price: 3000, stock: 50 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HDW2431T-AS (4MP Lite IR Dome)', slug: 'dahua-ipc-hdw2431t-as', price: 3500, stock: 40 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HFW2439S-SA-LED (4MP Full-color)', slug: 'dahua-ipc-hfw2439s-sa-led', price: 3800, stock: 40 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HDW2439THP-AS-LED (4MP Full-color Fixed)', slug: 'dahua-ipc-hdw2439thp-as-led', price: 3600, stock: 42 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HFW2439SP-SA-LED (4MP Full-color)', slug: 'dahua-ipc-hfw2439sp-sa-led', price: 3700, stock: 38 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HDW2849H-S-IL (8MP Smart Dual Light Dome)', slug: 'dahua-ipc-hdw2849h-s-il', price: 4500, stock: 35 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HFW2849S-S-IL (8MP Smart Dual Light Bullet)', slug: 'dahua-ipc-hfw2849s-s-il', price: 4800, stock: 30 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HDW2849H-S-IL-QS (8MP Lite Dual Light)', slug: 'dahua-ipc-hdw2849h-s-il-qs', price: 4200, stock: 32 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HDW3449H-AS-PV (4MP Smart Dual Active)', slug: 'dahua-ipc-hdw3449h-as-pv', price: 5200, stock: 28 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HDW3849H-AS-PV (8MP Full-color Active Dome)', slug: 'dahua-ipc-hdw3849h-as-pv', price: 6500, stock: 25 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HFW3849H-AS-PV (8MP Full-color Active Bullet)', slug: 'dahua-ipc-hfw3849h-as-pv', price: 6800, stock: 22 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HFW3549H-AS-PV (5MP Full-color Active)', slug: 'dahua-ipc-hfw3549h-as-pv', price: 5800, stock: 25 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HDW3849H-ZAS (8MP Motorized Varifocal Dome)', slug: 'dahua-ipc-hdw3849h-zas', price: 8500, stock: 15 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HFW2831S-ZAS (8MP IR Varifocal Bullet)', slug: 'dahua-ipc-hfw2831s-zas', price: 6200, stock: 20 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HFW3849H-ZAS-PV (8MP Smart Dual Varifocal)', slug: 'dahua-ipc-hfw3849h-zas-pv', price: 8000, stock: 12 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HFW4849H-ASE-LED (8MP ePoE Full-color)', slug: 'dahua-ipc-hfw4849h-ase-led', price: 9200, stock: 10 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HDW5842T-ASE (8MP AI WizMind Dome)', slug: 'dahua-ipc-hdw5842t-ase', price: 12500, stock: 8 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HFW5842E-ZE (8MP AI WizMind Bullet)', slug: 'dahua-ipc-hfw5842e-ze', price: 13500, stock: 6 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HDW3849H-ZEP-AS-PV (8MP Smart Dual Active Varifocal)', slug: 'dahua-ipc-hdw3849h-zep-as-pv', price: 9500, stock: 10 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua IPC-HFW2831T-ZAS (8MP IR Varifocal)', slug: 'dahua-ipc-hfw2831t-zas', price: 5500, stock: 18 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua SD49425XB-HNR (25x 4MP WizMind PTZ)', slug: 'dahua-sd49425xb-hnr', price: 45000, stock: 4 },
  { categorySlug: 'ip-kamery-dahua', brandName: 'Dahua', name: 'Dahua SD49825XB-HNR (25x 8MP WizMind PTZ)', slug: 'dahua-sd49825xb-hnr', price: 65000, stock: 2 },

  // ─── IP КАМЕРЫ HIKVISION ────────────────────────────────────────────────────
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD1143G2-I (4MP Dome)', slug: 'hik-ds-2cd1143g2-i', price: 3200, stock: 60 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD1183G2-I (8MP Dome)', slug: 'hik-ds-2cd1183g2-i', price: 4800, stock: 50 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD1047G2-L (4MP ColorVu Dome)', slug: 'hik-ds-2cd1047g2-l', price: 3800, stock: 55 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD1087G2-L (8MP ColorVu Dome)', slug: 'hik-ds-2cd1087g2-l', price: 5500, stock: 45 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2143G2-I (4MP AcuSense Dome)', slug: 'hik-ds-2cd2143g2-i', price: 4200, stock: 50 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2143G2-IS (4MP AcuSense Dome с аудио)', slug: 'hik-ds-2cd2143g2-is', price: 4800, stock: 40 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2143G2-IU (4MP AcuSense Dome с микрофоном)', slug: 'hik-ds-2cd2143g2-iu', price: 4500, stock: 45 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2183G2-I (8MP AcuSense Dome)', slug: 'hik-ds-2cd2183g2-i', price: 6500, stock: 35 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2183G2-IS (8MP AcuSense Dome с аудио)', slug: 'hik-ds-2cd2183g2-is', price: 7200, stock: 30 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2183G2-IU (8MP AcuSense Dome с микрофоном)', slug: 'hik-ds-2cd2183g2-iu', price: 6800, stock: 32 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2343G2-I (4MP AcuSense Turret)', slug: 'hik-ds-2cd2343g2-i', price: 4200, stock: 45 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2343G2-IU (4MP AcuSense Turret с микрофоном)', slug: 'hik-ds-2cd2343g2-iu', price: 4500, stock: 40 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2383G2-I (8MP AcuSense Turret)', slug: 'hik-ds-2cd2383g2-i', price: 6500, stock: 32 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2347G2-LU (4MP ColorVu Dome)', slug: 'hik-ds-2cd2347g2-lu', price: 5500, stock: 38 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2387G2-LU (8MP ColorVu Dome)', slug: 'hik-ds-2cd2387g2-lu', price: 8000, stock: 28 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2047G2-LU (4MP ColorVu Bullet)', slug: 'hik-ds-2cd2047g2-lu', price: 5500, stock: 35 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2087G2-LU (8MP ColorVu Bullet)', slug: 'hik-ds-2cd2087g2-lu', price: 8200, stock: 25 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2T43G2-2I (4MP AcuSense Bullet 60м)', slug: 'hik-ds-2cd2t43g2-2i', price: 4500, stock: 42 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2T43G2-4I (4MP AcuSense Bullet 80м)', slug: 'hik-ds-2cd2t43g2-4i', price: 5200, stock: 38 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2T83G2-2I (8MP AcuSense Bullet 60м)', slug: 'hik-ds-2cd2t83g2-2i', price: 6800, stock: 30 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2T83G2-4I (8MP AcuSense Bullet 80м)', slug: 'hik-ds-2cd2t83g2-4i', price: 7500, stock: 25 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2T47G2-L (4MP ColorVu Bullet)', slug: 'hik-ds-2cd2t47g2-l', price: 5800, stock: 35 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2T87G2-L (8MP ColorVu Bullet)', slug: 'hik-ds-2cd2t87g2-l', price: 8500, stock: 25 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2623G2-IZS (2MP AcuSense Varifocal)', slug: 'hik-ds-2cd2623g2-izs', price: 6800, stock: 18 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2643G2-IZS (4MP AcuSense Varifocal)', slug: 'hik-ds-2cd2643g2-izs', price: 8500, stock: 15 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2683G2-IZS (8MP AcuSense Varifocal)', slug: 'hik-ds-2cd2683g2-izs', price: 12000, stock: 10 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD3043G2-IU (4MP AcuSense Dome)', slug: 'hik-ds-2cd3043g2-iu', price: 5800, stock: 22 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD3083G2-IU (8MP AcuSense Dome)', slug: 'hik-ds-2cd3083g2-iu', price: 8500, stock: 18 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD3143G2-I (4MP AcuSense Varifocal Dome)', slug: 'hik-ds-2cd3143g2-i', price: 7500, stock: 15 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD3183G2-I (8MP AcuSense Varifocal Dome)', slug: 'hik-ds-2cd3183g2-i', price: 11000, stock: 10 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2155FWD-IS (5MP WDR Dome с аудио)', slug: 'hik-ds-2cd2155fwd-is', price: 5200, stock: 20 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2185FWD-IS (8MP WDR Dome с аудио)', slug: 'hik-ds-2cd2185fwd-is', price: 7000, stock: 15 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2386G2-I (8MP AcuSense Dome)', slug: 'hik-ds-2cd2386g2-i', price: 7800, stock: 18 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2386G2-ISU/SL (8MP AcuSense Spotlight)', slug: 'hik-ds-2cd2386g2-isu-sl', price: 9500, stock: 12 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2047G2-L (4MP ColorVu Fixed Dome)', slug: 'hik-ds-2cd2047g2-l', price: 5200, stock: 28 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2T45FWD-I8 (4MP WDR Bullet)', slug: 'hik-ds-2cd2t45fwd-i8', price: 5000, stock: 22 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CD2T85FWD-I8 (8MP WDR Bullet)', slug: 'hik-ds-2cd2t85fwd-i8', price: 7500, stock: 18 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2DE4425IWG-E (4MP PTZ 25x)', slug: 'hik-ds-2de4425iwg-e', price: 35000, stock: 5 },
  { categorySlug: 'ip-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2DE4A425IWG-E (4MP PTZ 25x AI)', slug: 'hik-ds-2de4a425iwg-e', price: 45000, stock: 3 },

  // ─── IP КАМЕРЫ EMIN ─────────────────────────────────────────────────────────
  { categorySlug: 'ip-kamery-emin', brandName: 'EMIN', name: 'EMIN EM-IP2MP-2812 (2MP IP Dome)', slug: 'emin-em-ip2mp-2812', price: 2500, stock: 40 },
  { categorySlug: 'ip-kamery-emin', brandName: 'EMIN', name: 'EMIN EM-IP4MP-2812 (4MP IP Dome)', slug: 'emin-em-ip4mp-2812', price: 3200, stock: 35 },
  { categorySlug: 'ip-kamery-emin', brandName: 'EMIN', name: 'EMIN EM-IP8MP-2812 (8MP IP Dome)', slug: 'emin-em-ip8mp-2812', price: 4800, stock: 25 },
  { categorySlug: 'ip-kamery-emin', brandName: 'EMIN', name: 'EMIN EM-IP4MP-B2812 (4MP IP Bullet)', slug: 'emin-em-ip4mp-b2812', price: 3400, stock: 30 },
  { categorySlug: 'ip-kamery-emin', brandName: 'EMIN', name: 'EMIN EM-IP8MP-B2812 (8MP IP Bullet)', slug: 'emin-em-ip8mp-b2812', price: 5000, stock: 20 },

  // ─── TVI КАМЕРЫ HIKVISION ───────────────────────────────────────────────────
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE56D0T-IRMF (2MP TVI Dome)', slug: 'hik-ds-2ce56d0t-irmf', price: 1800, stock: 80 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE56H0T-ITMF (5MP TVI Dome)', slug: 'hik-ds-2ce56h0t-itmf', price: 2800, stock: 60 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE56H0T-ITPF (5MP TVI Dome с ИК)', slug: 'hik-ds-2ce56h0t-itpf', price: 3000, stock: 55 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE56H0T-IT3F (5MP TVI Dome 40м ИК)', slug: 'hik-ds-2ce56h0t-it3f', price: 3200, stock: 50 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE76H0T-ITMF (5MP TVI Mini Dome)', slug: 'hik-ds-2ce76h0t-itmf', price: 3500, stock: 45 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE16D0T-IRF (2MP TVI Bullet)', slug: 'hik-ds-2ce16d0t-irf', price: 1900, stock: 75 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE16H0T-ITF (5MP TVI Bullet)', slug: 'hik-ds-2ce16h0t-itf', price: 2900, stock: 55 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE16H0T-IT3F (5MP TVI Bullet 40м)', slug: 'hik-ds-2ce16h0t-it3f', price: 3100, stock: 50 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE16H0T-IT5F (5MP TVI Bullet 80м)', slug: 'hik-ds-2ce16h0t-it5f', price: 3500, stock: 40 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE10DF3T-FS (2MP ColorVu TVI Dome)', slug: 'hik-ds-2ce10df3t-fs', price: 2500, stock: 60 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE10KF3T-FS (5MP ColorVu TVI Dome)', slug: 'hik-ds-2ce10kf3t-fs', price: 3800, stock: 45 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE12DF3T-FS (2MP ColorVu TVI Bullet)', slug: 'hik-ds-2ce12df3t-fs', price: 2600, stock: 55 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE12KF3T-FS (5MP ColorVu TVI Bullet)', slug: 'hik-ds-2ce12kf3t-fs', price: 4000, stock: 40 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE56D8T-ITZE (2MP WDR TVI Dome Varifocal)', slug: 'hik-ds-2ce56d8t-itze', price: 3500, stock: 35 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE56H8T-ITZE (5MP WDR TVI Dome Varifocal)', slug: 'hik-ds-2ce56h8t-itze', price: 5000, stock: 25 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE16D8T-ITZE (2MP WDR TVI Bullet Varifocal)', slug: 'hik-ds-2ce16d8t-itze', price: 3600, stock: 32 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE16H8T-ITZE (5MP WDR TVI Bullet Varifocal)', slug: 'hik-ds-2ce16h8t-itze', price: 5200, stock: 22 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE76H8T-ITZE (5MP WDR TVI Dome Varifocal)', slug: 'hik-ds-2ce76h8t-itze', price: 5500, stock: 20 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'HiWatch', name: 'HiWatch HWT-B120-P (2MP TVI/AHD/CVI Bullet)', slug: 'hiwatch-hwt-b120-p', price: 1700, stock: 80 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'HiWatch', name: 'HiWatch HWT-B150-P (5MP TVI/AHD/CVI Bullet)', slug: 'hiwatch-hwt-b150-p', price: 2700, stock: 65 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'HiWatch', name: 'HiWatch HWT-D120-P (2MP TVI/AHD/CVI Dome)', slug: 'hiwatch-hwt-d120-p', price: 1650, stock: 80 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'HiWatch', name: 'HiWatch HWT-D150-P (5MP TVI/AHD/CVI Dome)', slug: 'hiwatch-hwt-d150-p', price: 2650, stock: 65 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE56D0T-VPHIT (2MP TVI Dome PoC)', slug: 'hik-ds-2ce56d0t-vphit', price: 2200, stock: 40 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE56H0T-VPHIT (5MP TVI Dome PoC)', slug: 'hik-ds-2ce56h0t-vphit', price: 3300, stock: 30 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE76D0T-ITMFS (2MP TVI Dome с микрофоном)', slug: 'hik-ds-2ce76d0t-itmfs', price: 2400, stock: 45 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE76H0T-ITMFS (5MP TVI Dome с микрофоном)', slug: 'hik-ds-2ce76h0t-itmfs', price: 3600, stock: 38 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE17H0T-IT3F (5MP TVI Bullet уличный)', slug: 'hik-ds-2ce17h0t-it3f', price: 3400, stock: 42 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE72HFT-F (5MP ColorVu TVI Dome)', slug: 'hik-ds-2ce72hft-f', price: 4200, stock: 30 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE12HFT-F (5MP ColorVu TVI Bullet)', slug: 'hik-ds-2ce12hft-f', price: 4300, stock: 28 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE72HFT-F28 (5MP ColorVu TVI Dome 2.8мм)', slug: 'hik-ds-2ce72hft-f28', price: 4000, stock: 32 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE56H0T-IT3ZE (5MP TVI Dome Varifocal PoC)', slug: 'hik-ds-2ce56h0t-it3ze', price: 4500, stock: 22 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE16H0T-IT3ZE (5MP TVI Bullet Varifocal PoC)', slug: 'hik-ds-2ce16h0t-it3ze', price: 4700, stock: 20 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE28H0T-IT3F (5MP TVI Box)', slug: 'hik-ds-2ce28h0t-it3f', price: 3800, stock: 25 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE56H0T-IT3ZF (5MP TVI Dome Motorized)', slug: 'hik-ds-2ce56h0t-it3zf', price: 4800, stock: 18 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE16H0T-IT3ZF (5MP TVI Bullet Motorized)', slug: 'hik-ds-2ce16h0t-it3zf', price: 5000, stock: 15 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE56K0T-ITMF (8MP TVI Dome)', slug: 'hik-ds-2ce56k0t-itmf', price: 4500, stock: 28 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE16K0T-ITF (8MP TVI Bullet)', slug: 'hik-ds-2ce16k0t-itf', price: 4600, stock: 25 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE76K0T-ITMFS (8MP TVI Mini Dome)', slug: 'hik-ds-2ce76k0t-itmfs', price: 5000, stock: 20 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE57K0T-VPITF (8MP TVI Dome PoC)', slug: 'hik-ds-2ce57k0t-vpitf', price: 5200, stock: 18 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE17K0T-IT3F (8MP TVI Bullet уличный)', slug: 'hik-ds-2ce17k0t-it3f', price: 5500, stock: 15 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE56K0T-IT3ZF (8MP TVI Dome Motorized)', slug: 'hik-ds-2ce56k0t-it3zf', price: 7000, stock: 10 },
  { categorySlug: 'tvi-kamery-hikvision', brandName: 'Hikvision', name: 'Hikvision DS-2CE16K0T-IT3ZF (8MP TVI Bullet Motorized)', slug: 'hik-ds-2ce16k0t-it3zf', price: 7200, stock: 8 },

  // ─── WIFI КАМЕРЫ ────────────────────────────────────────────────────────────
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-F42FEP-D (4MP Bullet 2E PoE)', slug: 'imou-ipc-f42fep-d', price: 3800, stock: 35 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-F46FP (4MP Bullet 2 PoE)', slug: 'imou-ipc-f46fp', price: 4200, stock: 30 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-B46LP-D (4MP Bullet 2E WiFi)', slug: 'imou-ipc-b46lp-d', price: 3500, stock: 40 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-B42P-D (4MP Bullet 2 WiFi)', slug: 'imou-ipc-b42p-d', price: 3200, stock: 42 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-F22FP (2MP Bullet 2 PoE)', slug: 'imou-ipc-f22fp', price: 2800, stock: 45 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-A22EP (2MP Cell Pro WiFi)', slug: 'imou-ipc-a22ep', price: 2500, stock: 50 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-A42P (4MP Cell Pro WiFi)', slug: 'imou-ipc-a42p', price: 3000, stock: 45 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-GS7EP-3M0WE (3MP Cue 2 WiFi)', slug: 'imou-ipc-gs7ep-3m0we', price: 2200, stock: 55 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-C22EP (2MP Cue 2 PoE)', slug: 'imou-ipc-c22ep', price: 2000, stock: 60 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-T26EP (2MP Turret PoE)', slug: 'imou-ipc-t26ep', price: 2600, stock: 50 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-T46EP (4MP Turret PoE)', slug: 'imou-ipc-t46ep', price: 3400, stock: 40 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-T26H-S2 (2MP Turret WiFi)', slug: 'imou-ipc-t26h-s2', price: 2400, stock: 48 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-D46P (4MP Dome PoE)', slug: 'imou-ipc-d46p', price: 3200, stock: 38 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-D22EP (2MP Dome PoE)', slug: 'imou-ipc-d22ep', price: 2300, stock: 50 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-G26EP (2MP Looc PoE)', slug: 'imou-ipc-g26ep', price: 2100, stock: 55 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-G46P (4MP Looc PoE)', slug: 'imou-ipc-g46p', price: 3000, stock: 42 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-S6DP (4MP Ranger 2C PTZ WiFi)', slug: 'imou-ipc-s6dp', price: 4500, stock: 25 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-S41FEP (4MP Ranger 2 PTZ PoE)', slug: 'imou-ipc-s41fep', price: 5000, stock: 20 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-F88FIP (8MP Bullet 2 PoE)', slug: 'imou-ipc-f88fip', price: 6500, stock: 18 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-T88FIP (8MP Turret PoE)', slug: 'imou-ipc-t88fip', price: 6800, stock: 15 },
  { categorySlug: 'wifi-kamery', brandName: 'TP-Link', name: 'TP-Link VIGI C340 (4MP Turret PoE)', slug: 'tplink-vigi-c340', price: 3200, stock: 40 },
  { categorySlug: 'wifi-kamery', brandName: 'TP-Link', name: 'TP-Link VIGI C440 (4MP Dome PoE)', slug: 'tplink-vigi-c440', price: 3400, stock: 38 },
  { categorySlug: 'wifi-kamery', brandName: 'TP-Link', name: 'TP-Link VIGI C340W (4MP Turret WiFi)', slug: 'tplink-vigi-c340w', price: 3000, stock: 42 },
  { categorySlug: 'wifi-kamery', brandName: 'TP-Link', name: 'TP-Link VIGI C440W (4MP Dome WiFi)', slug: 'tplink-vigi-c440w', price: 3200, stock: 40 },
  { categorySlug: 'wifi-kamery', brandName: 'TP-Link', name: 'TP-Link VIGI C540V (5MP Varifocal Dome PoE)', slug: 'tplink-vigi-c540v', price: 5500, stock: 22 },
  { categorySlug: 'wifi-kamery', brandName: 'TP-Link', name: 'TP-Link VIGI C540 (5MP Outdoor Dome PoE)', slug: 'tplink-vigi-c540', price: 4500, stock: 28 },
  { categorySlug: 'wifi-kamery', brandName: 'TP-Link', name: 'TP-Link VIGI C330 (3MP Outdoor Bullet PoE)', slug: 'tplink-vigi-c330', price: 2800, stock: 45 },
  { categorySlug: 'wifi-kamery', brandName: 'TP-Link', name: 'TP-Link VIGI C330W (3MP Outdoor Bullet WiFi)', slug: 'tplink-vigi-c330w', price: 2600, stock: 48 },
  { categorySlug: 'wifi-kamery', brandName: 'TP-Link', name: 'TP-Link VIGI C320WS (2MP Indoor Dome WiFi)', slug: 'tplink-vigi-c320ws', price: 2000, stock: 55 },
  { categorySlug: 'wifi-kamery', brandName: 'TP-Link', name: 'TP-Link VIGI C200 (2MP Pan Tilt Home WiFi)', slug: 'tplink-vigi-c200', price: 2200, stock: 50 },
  { categorySlug: 'wifi-kamery', brandName: 'TP-Link', name: 'TP-Link VIGI C210 (3MP Pan Tilt Home WiFi)', slug: 'tplink-vigi-c210', price: 2500, stock: 45 },
  { categorySlug: 'wifi-kamery', brandName: 'TP-Link', name: 'TP-Link VIGI C400HP (4MP Outdoor Bullet PoE)', slug: 'tplink-vigi-c400hp', price: 3500, stock: 35 },
  { categorySlug: 'wifi-kamery', brandName: 'Dahua', name: 'Dahua IPC-F42FEP-D IMOU (4MP Full-color WiFi Bullet)', slug: 'dahua-ipc-f42fep-wifi', price: 3900, stock: 32 },
  { categorySlug: 'wifi-kamery', brandName: 'Hikvision', name: 'Hikvision DS-2DE2A404IW-DE3 (4MP PTZ WiFi 4x)', slug: 'hik-ds-2de2a404iw-de3', price: 8500, stock: 12 },
  { categorySlug: 'wifi-kamery', brandName: 'Hikvision', name: 'Hikvision DS-2CD2143G2-IU/SL (4MP AcuSense Spotlight)', slug: 'hik-ds-2cd2143g2-iu-sl', price: 6200, stock: 18 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-B89HS-IMOU (8MP Bullet 2 PoE H.265)', slug: 'imou-ipc-b89hs', price: 7000, stock: 15 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-T85HP (8MP Turret PoE AI)', slug: 'imou-ipc-t85hp', price: 7500, stock: 12 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-L26P (2MP Link PoE)', slug: 'imou-ipc-l26p', price: 2800, stock: 45 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-L46P (4MP Link PoE)', slug: 'imou-ipc-l46p', price: 3600, stock: 38 },
  { categorySlug: 'wifi-kamery', brandName: 'TP-Link', name: 'TP-Link VIGI C240 (4MP Mini Dome PoE)', slug: 'tplink-vigi-c240', price: 3100, stock: 40 },
  { categorySlug: 'wifi-kamery', brandName: 'TP-Link', name: 'TP-Link VIGI C240W (4MP Mini Dome WiFi)', slug: 'tplink-vigi-c240w', price: 2900, stock: 42 },
  { categorySlug: 'wifi-kamery', brandName: 'TP-Link', name: 'TP-Link VIGI C430 (3MP Mini Dome PoE)', slug: 'tplink-vigi-c430', price: 2700, stock: 45 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-B42FP-D (4MP Bullet 2E Full-color WiFi)', slug: 'imou-ipc-b42fp-d', price: 3300, stock: 38 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-S6FP (4MP Ranger 2 PTZ WiFi Full-color)', slug: 'imou-ipc-s6fp', price: 5500, stock: 18 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-F42N-D (4MP Bullet 2E 4G SIM)', slug: 'imou-ipc-f42n-d', price: 7000, stock: 10 },
  { categorySlug: 'wifi-kamery', brandName: 'IMOU', name: 'IMOU IPC-A82P (8MP Cell Pro WiFi)', slug: 'imou-ipc-a82p', price: 5500, stock: 15 },

  // ─── CVI КАМЕРЫ DAHUA ───────────────────────────────────────────────────────
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HDW1000M (1MP CVI Dome)', slug: 'dahua-hac-hdw1000m', price: 600, stock: 60 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HDW1200S (2MP CVI Dome 3.6мм)', slug: 'dahua-hac-hdw1200s', price: 921, stock: 80 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HDW1200TL (2MP CVI IR Dome)', slug: 'dahua-hac-hdw1200tl', price: 1050, stock: 70 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HDW1239TLQN (2MP Full-color IR Dome)', slug: 'dahua-hac-hdw1239tlqn', price: 1100, stock: 65 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HFW1200TL (2MP CVI Bullet)', slug: 'dahua-hac-hfw1200tl', price: 950, stock: 75 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HFW1239S (2MP Full-color CVI Bullet)', slug: 'dahua-hac-hfw1239s', price: 1300, stock: 60 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HDW1400TL (4MP CVI IR Dome)', slug: 'dahua-hac-hdw1400tl', price: 1350, stock: 65 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HFW1400TL (4MP CVI IR Bullet)', slug: 'dahua-hac-hfw1400tl', price: 1400, stock: 60 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HDW2249T-I-NI (2MP WDR CVI Dome)', slug: 'dahua-hac-hdw2249t-i-ni', price: 1500, stock: 50 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HDW1500TQ (5MP CVI Lite Dome)', slug: 'dahua-hac-hdw1500tq', price: 1600, stock: 55 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HFW1500TQ (5MP CVI Lite Bullet)', slug: 'dahua-hac-hfw1500tq', price: 1650, stock: 52 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HDW1500S (5MP CVI Dome)', slug: 'dahua-hac-hdw1500s', price: 1800, stock: 50 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HFW1500S (5MP CVI Bullet)', slug: 'dahua-hac-hfw1500s', price: 1900, stock: 48 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HDW2501T (5MP CVI Smart Dome)', slug: 'dahua-hac-hdw2501t', price: 2000, stock: 45 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HFW2501T (5MP CVI Smart Bullet)', slug: 'dahua-hac-hfw2501t', price: 2100, stock: 42 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HDW1801T (8MP CVI Dome)', slug: 'dahua-hac-hdw1801t', price: 3200, stock: 35 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HFW1801T (8MP CVI Bullet)', slug: 'dahua-hac-hfw1801t', price: 3400, stock: 32 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HDW2802T-A (8MP Full-color CVI Dome)', slug: 'dahua-hac-hdw2802t-a', price: 3800, stock: 28 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HFW2802T-A (8MP Full-color CVI Bullet)', slug: 'dahua-hac-hfw2802t-a', price: 4000, stock: 25 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HDW3800T (8MP 4K CVI Dome)', slug: 'dahua-hac-hdw3800t', price: 4500, stock: 20 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HFW3800T (8MP 4K CVI Bullet)', slug: 'dahua-hac-hfw3800t', price: 4800, stock: 18 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HFW2249S-A-LED (2MP Full-color Active Bullet)', slug: 'dahua-hac-hfw2249s-a-led', price: 2200, stock: 40 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HDW3849T-ZH (8MP Smart Dual Light Varifocal)', slug: 'dahua-hac-hdw3849t-zh', price: 5500, stock: 15 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-HFW3849E-Z-LED (8MP Full-color Varifocal Bullet)', slug: 'dahua-hac-hfw3849e-z-led', price: 6200, stock: 12 },
  { categorySlug: 'cvi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-HAC-PFW3849S1-A360-LED (8MP Full-color 360°)', slug: 'dahua-hac-pfw3849s1-a360-led', price: 8200, stock: 8 },

  // ─── Wi-Fi КАМЕРЫ EZVIZ ──────────────────────────────────────────────────────
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-H1C (2MP Indoor Pan/Tilt WiFi)', slug: 'ezviz-cs-h1c', price: 2000, stock: 55 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-H3c (2MP Pan/Tilt WiFi 360°)', slug: 'ezviz-cs-h3c', price: 2200, stock: 60 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-H3 (3MP Color Night Vision Pan/Tilt WiFi)', slug: 'ezviz-cs-h3', price: 2500, stock: 55 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-C3W (2MP Outdoor WiFi Bullet ColorNight)', slug: 'ezviz-cs-c3w', price: 2500, stock: 50 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-CV310 (2MP WiFi Bullet Outdoor)', slug: 'ezviz-cs-cv310', price: 2200, stock: 48 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-H2c (2MP Indoor Cube WiFi)', slug: 'ezviz-cs-h2c', price: 2300, stock: 52 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-C6N (4MP Pan/Tilt AI WiFi)', slug: 'ezviz-cs-c6n', price: 2600, stock: 50 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-TY2 (3MP WiFi Turret Outdoor)', slug: 'ezviz-cs-ty2', price: 2600, stock: 45 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-H6c (4MP 2K Pan/Tilt Color WiFi)', slug: 'ezviz-cs-h6c', price: 2800, stock: 50 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-C3T (4MP Turret WiFi Outdoor)', slug: 'ezviz-cs-c3t', price: 2800, stock: 45 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-C3N (4MP WiFi Smart Outdoor Bullet)', slug: 'ezviz-cs-c3n', price: 2800, stock: 48 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-H6 (4MP Color Night Pan/Tilt WiFi)', slug: 'ezviz-cs-h6', price: 3000, stock: 45 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-C8P (5MP AI WiFi Outdoor Bullet)', slug: 'ezviz-cs-c8p', price: 3000, stock: 42 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-H8c (5MP Pan/Tilt Color WiFi)', slug: 'ezviz-cs-h8c', price: 3200, stock: 42 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-C3W Pro (4MP Color Night Active Defense WiFi)', slug: 'ezviz-cs-c3w-pro', price: 3500, stock: 40 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-C8C (5MP Pan/Tilt 360° WiFi)', slug: 'ezviz-cs-c8c', price: 3500, stock: 38 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-H8 (5MP Color Night Active WiFi Bullet)', slug: 'ezviz-cs-h8', price: 3800, stock: 35 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-DB1C (2MP Video Doorbell WiFi)', slug: 'ezviz-cs-db1c', price: 4200, stock: 30 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-H3X (8MP Pan/Tilt 2K+ WiFi)', slug: 'ezviz-cs-h3x', price: 4500, stock: 28 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-C3A (2MP Battery Outdoor WiFi)', slug: 'ezviz-cs-c3a', price: 4800, stock: 25 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-C5X (5MP WiFi Varifocal AI Outdoor)', slug: 'ezviz-cs-c5x', price: 4800, stock: 25 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-DB2 (2K Video Doorbell WiFi)', slug: 'ezviz-cs-db2', price: 5000, stock: 22 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-BC1C (2MP Battery Outdoor Wire-Free WiFi)', slug: 'ezviz-cs-bc1c', price: 5500, stock: 20 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-BC2 (3MP Battery Outdoor Color Night WiFi)', slug: 'ezviz-cs-bc2', price: 6000, stock: 18 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-LC3 (2MP License Plate WiFi Camera)', slug: 'ezviz-cs-lc3', price: 6500, stock: 15 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-T8 (2MP Solar WiFi Outdoor)', slug: 'ezviz-cs-t8', price: 7500, stock: 15 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-EB3 (4G Solar Battery Camera)', slug: 'ezviz-cs-eb3', price: 8000, stock: 12 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-B6 (4G Outdoor Solar Camera 2K)', slug: 'ezviz-cs-b6', price: 9000, stock: 10 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-EP3A (2MP 4G Battery Camera)', slug: 'ezviz-cs-ep3a', price: 9500, stock: 8 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-H9c (3MP 4G Indoor Pan/Tilt)', slug: 'ezviz-cs-h9c', price: 5200, stock: 18 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-C8PF (3MP Pro WiFi Outdoor Bullet)', slug: 'ezviz-cs-c8pf', price: 3000, stock: 38 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-H6P (8MP 4K Pan/Tilt WiFi)', slug: 'ezviz-cs-h6p', price: 6500, stock: 12 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-H4 (8MP 4K Color Night Pan/Tilt WiFi)', slug: 'ezviz-cs-h4', price: 8000, stock: 10 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-C6W (4MP Outdoor Color Night AI WiFi)', slug: 'ezviz-cs-c6w', price: 4200, stock: 22 },
  { categorySlug: 'wifi-kamery-ezviz', brandName: 'EZVIZ', name: 'EZVIZ CS-CM1 (2K+ Security Light WiFi Camera)', slug: 'ezviz-cs-cm1', price: 15000, stock: 5 },

  // ─── СОЛНЕЧНЫЕ И СИМОЧНЫЕ ────────────────────────────────────────────────────
  { categorySlug: 'solnechnye-i-simochnye', brandName: 'IMOU', name: 'IMOU IPC-F42N-D (4MP 4G SIM Bullet Camera)', slug: 'imou-ipc-f42n-d-4g', price: 7000, stock: 12 },
  { categorySlug: 'solnechnye-i-simochnye', brandName: 'EZVIZ', name: 'EZVIZ CS-EB3 (4G Solar Battery Outdoor Camera)', slug: 'ezviz-cs-eb3-solar', price: 8000, stock: 10 },
  { categorySlug: 'solnechnye-i-simochnye', brandName: 'EZVIZ', name: 'EZVIZ CS-B6 (2K 4G Solar Outdoor Camera)', slug: 'ezviz-cs-b6-4g', price: 9000, stock: 8 },
  { categorySlug: 'solnechnye-i-simochnye', brandName: 'Dahua', name: 'Dahua DH-IPC-HFW1439S1P-LED-ASP (4MP Solar Bullet)', slug: 'dahua-ipc-hfw1439s1p-solar', price: 5500, stock: 15 },
  { categorySlug: 'solnechnye-i-simochnye', brandName: 'IMOU', name: 'IMOU IPC-A22EP-4G (2MP 4G Cell Pro Camera)', slug: 'imou-ipc-a22ep-4g', price: 6500, stock: 10 },
  { categorySlug: 'solnechnye-i-simochnye', brandName: 'EZVIZ', name: 'EZVIZ CS-EP3A-R100 (2MP Solar 4G Pan/Tilt Camera)', slug: 'ezviz-cs-ep3a-r100', price: 16000, stock: 5 },

  // ─── TVI КАМЕРЫ TVT ──────────────────────────────────────────────────────────
  { categorySlug: 'tvi-kamery-tvt', brandName: 'TVT', name: 'TVT TD-7504AS-D (4MP TVI Dome 2.8мм)', slug: 'tvt-td-7504as-d', price: 1070, stock: 60 },
  { categorySlug: 'tvi-kamery-tvt', brandName: 'TVT', name: 'TVT TD-7504IS-D (4MP TVI IR Dome 2.8мм)', slug: 'tvt-td-7504is-d', price: 1200, stock: 55 },
  { categorySlug: 'tvi-kamery-tvt', brandName: 'TVT', name: 'TVT TD-7524AS-B (4MP TVI Bullet 2.8мм)', slug: 'tvt-td-7524as-b', price: 1100, stock: 58 },
  { categorySlug: 'tvi-kamery-tvt', brandName: 'TVT', name: 'TVT TD-7504AS-D2 (4MP TVI Dome 3.6мм)', slug: 'tvt-td-7504as-d2', price: 1150, stock: 52 },
  { categorySlug: 'tvi-kamery-tvt', brandName: 'TVT', name: 'TVT TD-7508AS-D (8MP TVI Dome)', slug: 'tvt-td-7508as-d', price: 1500, stock: 45 },
  { categorySlug: 'tvi-kamery-tvt', brandName: 'TVT', name: 'TVT TD-7508IS-D (8MP TVI IR Dome)', slug: 'tvt-td-7508is-d', price: 1600, stock: 42 },
  { categorySlug: 'tvi-kamery-tvt', brandName: 'TVT', name: 'TVT TD-7528AS-B (8MP TVI Bullet)', slug: 'tvt-td-7528as-b', price: 2300, stock: 35 },

  // ─── IP КАМЕРЫ TVT ────────────────────────────────────────────────────────────
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9421S3 (2MP IP Dome H.265)', slug: 'tvt-td-9421s3', price: 1850, stock: 55 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9421E3 (2MP IP Bullet H.265)', slug: 'tvt-td-9421e3', price: 1900, stock: 52 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9441S3 (4MP IP Dome H.265)', slug: 'tvt-td-9441s3', price: 2200, stock: 50 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9441E3 (4MP IP Bullet H.265)', slug: 'tvt-td-9441e3', price: 2250, stock: 48 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9421S3B (2MP Full-color IP Dome)', slug: 'tvt-td-9421s3b', price: 2500, stock: 45 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9421E3B (2MP Full-color IP Bullet)', slug: 'tvt-td-9421e3b', price: 2600, stock: 42 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9441S3B (4MP Full-color IP Dome)', slug: 'tvt-td-9441s3b', price: 3000, stock: 40 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9441E3B (4MP Full-color IP Bullet)', slug: 'tvt-td-9441e3b', price: 3100, stock: 38 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9441S4 (4MP H.265+ IP Dome)', slug: 'tvt-td-9441s4', price: 3200, stock: 38 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9481S3 (8MP IP Dome H.265)', slug: 'tvt-td-9481s3', price: 3200, stock: 35 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9481E3 (8MP IP Bullet H.265)', slug: 'tvt-td-9481e3', price: 3400, stock: 32 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9421AS-2 (2MP AI IP Dome)', slug: 'tvt-td-9421as-2', price: 2800, stock: 40 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9441AS-2 (4MP AI IP Dome)', slug: 'tvt-td-9441as-2', price: 3500, stock: 35 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9448S4 (4MP 4K IP Dome)', slug: 'tvt-td-9448s4', price: 4500, stock: 28 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9481S3B (8MP Full-color IP Dome)', slug: 'tvt-td-9481s3b', price: 4200, stock: 28 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9481E3B (8MP Full-color IP Bullet)', slug: 'tvt-td-9481e3b', price: 4400, stock: 25 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9481AS-2 (8MP AI IP Dome)', slug: 'tvt-td-9481as-2', price: 5000, stock: 22 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9481S4 (8MP H.265+ IP Dome)', slug: 'tvt-td-9481s4', price: 4800, stock: 22 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9488S4 (8MP 4K IP Dome)', slug: 'tvt-td-9488s4', price: 6500, stock: 18 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9523E3 (5MP IP Bullet H.265)', slug: 'tvt-td-9523e3', price: 3600, stock: 30 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9584E3 (8MP 4K IR IP Bullet)', slug: 'tvt-td-9584e3', price: 5000, stock: 20 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9443D2S-3 (4MP Dual-lens IP Camera)', slug: 'tvt-td-9443d2s-3', price: 6000, stock: 15 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9553E2 (5MP PTZ IP Camera 2x)', slug: 'tvt-td-9553e2', price: 6000, stock: 12 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9553E4 (5MP PTZ IP Camera 4x)', slug: 'tvt-td-9553e4', price: 8000, stock: 10 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9583E2 (8MP PTZ IP Camera 2x)', slug: 'tvt-td-9583e2', price: 9500, stock: 8 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9583E3 (8MP PTZ IP Camera 3x)', slug: 'tvt-td-9583e3', price: 12000, stock: 6 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9425S3L (5MP IP Turret Full-color)', slug: 'tvt-td-9425s3l', price: 3800, stock: 28 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9485S3L (8MP IP Turret Full-color)', slug: 'tvt-td-9485s3l', price: 5200, stock: 20 },
  { categorySlug: 'ip-kamery-tvt', brandName: 'TVT', name: 'TVT TD-9484S4 (8MP 4K Starlight Dome)', slug: 'tvt-td-9484s4', price: 28300, stock: 3 },

  // ─── Wi-Fi КАМЕРЫ DAHUA ──────────────────────────────────────────────────────
  { categorySlug: 'wifi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-IPC-F42FEP-D IMOU (4MP Full-color WiFi Bullet 2E)', slug: 'dahua-ipc-f42fep-d-wifi', price: 3700, stock: 35 },
  { categorySlug: 'wifi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-IPC-HFW1439S1-LED-ASP (4MP Full-color Solar WiFi)', slug: 'dahua-ipc-hfw1439s1-led-asp', price: 4200, stock: 25 },
  { categorySlug: 'wifi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-P5AE-PV (5MP Pentalight Smart WiFi Bullet)', slug: 'dahua-p5ae-pv', price: 4500, stock: 20 },
  { categorySlug: 'wifi-kamery-dahua', brandName: 'Dahua', name: 'Dahua DH-F5AEF-PV (5MP Full-color Active Deterrence WiFi)', slug: 'dahua-f5aef-pv', price: 5500, stock: 15 },

  // ─── КОАКСИАЛЬНЫЙ С ПИТАНИЕМ ─────────────────────────────────────────────────
  { categorySlug: 'koaksialnyy-s-pitaniem', brandName: 'Generic', name: 'Кабель коаксиальный RG59+2 (75 Ом, 1 метр)', slug: 'kabel-rg59-2-1m', price: 23, stock: 5000 },
  { categorySlug: 'koaksialnyy-s-pitaniem', brandName: 'Generic', name: 'Кабель коаксиальный RG59+2 Premium (75 Ом, 1 метр)', slug: 'kabel-rg59-2-premium-1m', price: 29, stock: 3000 },
  { categorySlug: 'koaksialnyy-s-pitaniem', brandName: 'Generic', name: 'Кабель коаксиальный RG59+2 (бухта 100 метров)', slug: 'kabel-rg59-2-100m', price: 2300, stock: 50 },

  // ─── UTP ─────────────────────────────────────────────────────────────────────
  { categorySlug: 'utp', brandName: 'Generic', name: 'UTP Cat5e 4x2x0.5 (наружный, 1 метр)', slug: 'utp-cat5e-outdoor-1m', price: 34, stock: 5000 },
  { categorySlug: 'utp', brandName: 'Generic', name: 'UTP Cat5e 4x2x0.5 (внутренний, 1 метр)', slug: 'utp-cat5e-indoor-1m', price: 26, stock: 8000 },
  { categorySlug: 'utp', brandName: 'Generic', name: 'UTP Cat5e (бухта 305 метров, наружный)', slug: 'utp-cat5e-outdoor-305m', price: 9200, stock: 30 },
  { categorySlug: 'utp', brandName: 'Generic', name: 'UTP Cat5e (бухта 305 метров, внутренний)', slug: 'utp-cat5e-indoor-305m', price: 7900, stock: 35 },
  { categorySlug: 'utp', brandName: 'Generic', name: 'UTP Cat6 4x2x0.57 (наружный, 1 метр)', slug: 'utp-cat6-outdoor-1m', price: 32, stock: 4000 },
  { categorySlug: 'utp', brandName: 'Generic', name: 'UTP Cat6 (бухта 305 метров, наружный)', slug: 'utp-cat6-outdoor-305m', price: 9700, stock: 25 },
  { categorySlug: 'utp', brandName: 'Generic', name: 'UTP Cat5e Cu (медный, 1 метр)', slug: 'utp-cat5e-cu-1m', price: 28, stock: 6000 },

  // ─── UTPар ────────────────────────────────────────────────────────────────────
  { categorySlug: 'utpar', brandName: 'Generic', name: 'UTPар Cat5e (бронированный, 1 метр)', slug: 'utpar-cat5e-1m', price: 33, stock: 4000 },
  { categorySlug: 'utpar', brandName: 'Generic', name: 'UTPар Cat5e (бронированный, бухта 305м)', slug: 'utpar-cat5e-305m', price: 9800, stock: 20 },
  { categorySlug: 'utpar', brandName: 'Generic', name: 'UTPар 4x2x0.5 с питанием (1 метр)', slug: 'utpar-4x2-s-pitaniem-1m', price: 21, stock: 3000 },
  { categorySlug: 'utpar', brandName: 'Generic', name: 'UTPар с питанием (бухта 305м)', slug: 'utpar-s-pitaniem-305m', price: 6800, stock: 18 },
  { categorySlug: 'utpar', brandName: 'Generic', name: 'UTPар Cat5e бронированный двойной (1 метр)', slug: 'utpar-cat5e-double-1m', price: 28, stock: 3500 },
  { categorySlug: 'utpar', brandName: 'Generic', name: 'UTPар Cat6 бронированный (1 метр)', slug: 'utpar-cat6-1m', price: 30, stock: 2500 },
  { categorySlug: 'utpar', brandName: 'Generic', name: 'UTPар Cat6 (бухта 305м)', slug: 'utpar-cat6-305m', price: 10500, stock: 15 },

  // ─── КАБЕЛЬ-КАНАЛ ─────────────────────────────────────────────────────────────
  { categorySlug: 'kabel-kanal', brandName: 'Generic', name: 'Кабель-канал 16x16мм (2 метра)', slug: 'kabel-kanal-16x16', price: 41, stock: 500 },
  { categorySlug: 'kabel-kanal', brandName: 'Generic', name: 'Кабель-канал 25x16мм (2 метра)', slug: 'kabel-kanal-25x16', price: 55, stock: 400 },
  { categorySlug: 'kabel-kanal', brandName: 'Generic', name: 'Кабель-канал 40x25мм (2 метра)', slug: 'kabel-kanal-40x25', price: 75, stock: 300 },
  { categorySlug: 'kabel-kanal', brandName: 'Generic', name: 'Кабель-канал 60x40мм (2 метра)', slug: 'kabel-kanal-60x40', price: 100, stock: 200 },

  // ─── UTP ВНУТРЕННИЙ ───────────────────────────────────────────────────────────
  { categorySlug: 'utp-vnutrenniy', brandName: 'Generic', name: 'UTP внутренний Cat5e (1 метр)', slug: 'utp-vnutrenniy-cat5e-1m', price: 13, stock: 10000 },
  { categorySlug: 'utp-vnutrenniy', brandName: 'Generic', name: 'UTP внутренний Cat5e (бухта 305м)', slug: 'utp-vnutrenniy-cat5e-305m', price: 4200, stock: 40 },
  { categorySlug: 'utp-vnutrenniy', brandName: 'Generic', name: 'UTP внутренний Cat6 (1 метр)', slug: 'utp-vnutrenniy-cat6-1m', price: 25, stock: 8000 },
  { categorySlug: 'utp-vnutrenniy', brandName: 'Generic', name: 'UTP внутренний Cat6 (бухта 305м)', slug: 'utp-vnutrenniy-cat6-305m', price: 7500, stock: 25 },
  { categorySlug: 'utp-vnutrenniy', brandName: 'Generic', name: 'UTP внутренний 4x2x0.5 медный (1 метр)', slug: 'utp-vnutrenniy-cu-1m', price: 34, stock: 5000 },

  // ─── ЭЛЕКТРИЧЕСКИЙ КАБЕЛЬ ─────────────────────────────────────────────────────
  { categorySlug: 'elektricheskiy-kabel', brandName: 'Generic', name: 'Кабель ШВВП 2x0.75 (1 метр)', slug: 'shvvp-2x075-1m', price: 13, stock: 5000 },
  { categorySlug: 'elektricheskiy-kabel', brandName: 'Generic', name: 'Кабель ШВВП 2x1.5 (1 метр)', slug: 'shvvp-2x15-1m', price: 15, stock: 4000 },

  // ─── БЛОКИ ПИТАНИЯ ────────────────────────────────────────────────────────────
  { categorySlug: 'bloki-pitaniya-videonab', brandName: 'Generic', name: 'Блок питания 12V 1A (для камер видеонаблюдения)', slug: 'bp-12v-1a', price: 200, stock: 200 },
  { categorySlug: 'bloki-pitaniya-videonab', brandName: 'Generic', name: 'Блок питания 12V 2A', slug: 'bp-12v-2a', price: 350, stock: 180 },
  { categorySlug: 'bloki-pitaniya-videonab', brandName: 'Generic', name: 'Блок питания 12V 3A', slug: 'bp-12v-3a', price: 450, stock: 150 },
  { categorySlug: 'bloki-pitaniya-videonab', brandName: 'Generic', name: 'Блок питания 12V 5A', slug: 'bp-12v-5a', price: 700, stock: 120 },
  { categorySlug: 'bloki-pitaniya-videonab', brandName: 'Generic', name: 'Блок питания 12V 10A', slug: 'bp-12v-10a', price: 1200, stock: 80 },
  { categorySlug: 'bloki-pitaniya-videonab', brandName: 'Generic', name: 'Блок питания 12V 15A', slug: 'bp-12v-15a', price: 1800, stock: 50 },
  { categorySlug: 'bloki-pitaniya-videonab', brandName: 'Generic', name: 'Блок питания 12V 20A', slug: 'bp-12v-20a', price: 2000, stock: 30 },
  { categorySlug: 'bloki-pitaniya-videonab', brandName: 'Generic', name: 'Распределительный блок питания 12V 5A (4 выхода)', slug: 'bp-12v-5a-4out', price: 500, stock: 100 },
  { categorySlug: 'bloki-pitaniya-videonab', brandName: 'Generic', name: 'Распределительный блок питания 12V 10A (8 выходов)', slug: 'bp-12v-10a-8out', price: 900, stock: 70 },
  { categorySlug: 'bloki-pitaniya-videonab', brandName: 'Generic', name: 'Распределительный блок питания 12V 20A (16 выходов)', slug: 'bp-12v-20a-16out', price: 1500, stock: 40 },
  { categorySlug: 'bloki-pitaniya-videonab', brandName: 'Generic', name: 'ИБП блок питания 12V 7Ah (резервный для камер)', slug: 'ibp-12v-7ah', price: 1800, stock: 25 },

  // ─── АКСЕССУАРЫ ДЛЯ ВИДЕОНАБЛЮДЕНИЯ ─────────────────────────────────────────
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Кронштейн настенный для купольной камеры', slug: 'kronshteyn-nastenniy-domovoy', price: 120, stock: 300 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Кронштейн угловой для камеры', slug: 'kronshteyn-uglovoy', price: 200, stock: 250 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Кронштейн вертикальный 40см', slug: 'kronshteyn-vertikalnyy-40', price: 320, stock: 150 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Кронштейн потолочный 20см', slug: 'kronshteyn-potolochniy-20', price: 280, stock: 150 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Кронштейн PTZ потолочный', slug: 'kronshteyn-ptz-potolochniy', price: 550, stock: 80 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Монтажная коробка для купольной камеры', slug: 'mont-korobka-domovaya', price: 180, stock: 200 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Разъем BNC обжимной (штука)', slug: 'razem-bnc-obzimnoj', price: 20, stock: 2000 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Разъем BNC пресс (штука)', slug: 'razem-bnc-press', price: 15, stock: 2000 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Пигтейл BNC 20см', slug: 'pigteil-bnc-20', price: 35, stock: 500 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Соединитель BNC (мама-мама)', slug: 'soedinitel-bnc', price: 25, stock: 800 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Видеобалун пассивный VB-A01 (пара)', slug: 'videobalun-passivnyy-vb-a01', price: 150, stock: 200 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Видеобалун активный VA-A04 (4 канала)', slug: 'videobalun-aktivnyy-va-a04', price: 2500, stock: 30 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Разъем питания DC 5.5x2.1 (штука)', slug: 'razem-dc-5521', price: 7, stock: 3000 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Разъем RJ45 (упаковка 100 шт)', slug: 'razem-rj45-100', price: 300, stock: 100 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Разветвитель питания 12V на 4 выхода', slug: 'razvetv-pitaniya-12v-4', price: 120, stock: 200 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Гермоввод PG16 для уличных камер', slug: 'germovvod-pg16', price: 25, stock: 500 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Гермоввод PG21 для кабеля', slug: 'germovvod-pg21', price: 35, stock: 400 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Хомут пластиковый 200мм (упаковка 100 шт)', slug: 'khomut-200mm-100', price: 35, stock: 300 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Хомут пластиковый 300мм (упаковка 100 шт)', slug: 'khomut-300mm-100', price: 50, stock: 250 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Саморез 4.2x16 (упаковка 100 шт)', slug: 'samorez-4216-100', price: 50, stock: 400 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Дюбель-гвоздь 6x40 (упаковка 100 шт)', slug: 'dyubel-gvozd-640-100', price: 65, stock: 350 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Скоба металлическая для кабеля (упаковка)', slug: 'skoba-metallicheskaya-kabel', price: 15, stock: 600 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'PoE сплиттер 48V-12V/2A', slug: 'poe-splitter-48v-12v', price: 850, stock: 60 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'PoE инжектор 802.3af/at 48V', slug: 'poe-injektor-80238', price: 950, stock: 50 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Тестер видеосигнала аналог/IP', slug: 'tester-videosignala', price: 1200, stock: 25 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Тестер IP камер IPC-1800 Plus', slug: 'tester-ip-ipc1800', price: 2200, stock: 15 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Нагреватель для уличного оборудования 12V 15W', slug: 'nagrevatel-ulichnyy-12v', price: 650, stock: 40 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Регулятор тока IP66 для кабеля', slug: 'regulyator-toka-ip66', price: 45, stock: 200 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Лента алюминиевая самоклеящаяся 50мм (5м)', slug: 'lenta-alyuminievaya-5m', price: 120, stock: 150 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Крышка для внешнего блока питания', slug: 'kryshka-bp-vneshniy', price: 80, stock: 200 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Монтажная пластина настенная для IP камер', slug: 'mont-plastina-nastennaya-ip', price: 90, stock: 300 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Удлинитель PoE до 500м (пара)', slug: 'udlinitel-poe-500m', price: 1800, stock: 20 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Коробка монтажная IP67 150x100x70мм', slug: 'korobka-mont-ip67-150', price: 350, stock: 100 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Клейкая монтажная площадка для камер', slug: 'klejkaya-ploshchadka-kamer', price: 40, stock: 400 },
  { categorySlug: 'aksessuary-videonab', brandName: 'Generic', name: 'Термоусадочная трубка набор (ассорти)', slug: 'termousa-trubka-nabor', price: 80, stock: 200 },

  // ─── ПРИБОРЫ GSM ──────────────────────────────────────────────────────────────
  { categorySlug: 'pribory-gsm', brandName: 'Proxima', name: 'Proxima S800-2GSM-SBK25-W Прибор охранно-пожарный (GSM,TM)', slug: 'proxima-s800-2gsm-sbk25-w', price: 10100, stock: 1 },
  { categorySlug: 'pribory-gsm', brandName: 'Chuango', name: 'Сигнализация Chuango CG-8800K8 + с ID', slug: 'chuango-cg-8800k8', price: 5150, stock: 1 },
  { categorySlug: 'pribory-gsm', brandName: 'Arsenal', name: 'Арсенал Гранит-5А Автодозвонная система безопасности', slug: 'arsenal-granit-5a', price: 11650, stock: 0 },
  { categorySlug: 'pribory-gsm', brandName: 'Arsenal', name: 'Арсенал Гранит-3А Автодозвонная система безопасности', slug: 'arsenal-granit-3a', price: 10950, stock: 0 },

  // ─── ПРИБОРЫ ──────────────────────────────────────────────────────────────────
  { categorySlug: 'pribory', brandName: 'Arsenal', name: 'Арсенал ВЕРСЕТ 06 УМ Прибор приемно-контрольный охранно-пожарный', slug: 'arsenal-verset-06-um', price: 5220, stock: 0 },

  // ─── ДАТЧИК РАЗБИТИЯ ──────────────────────────────────────────────────────────
  { categorySlug: 'datchik-razbitiya', brandName: 'Pyronix', name: 'Датчик разбития Pyronix BG16DF', slug: 'pyronix-bg16df', price: 942, stock: 2 },

  // ─── ДАТЧИК ДВИЖЕНИЯ ──────────────────────────────────────────────────────────
  { categorySlug: 'datchik-dvizheniya', brandName: 'Bingo', name: 'ИК-извещатель Bingo ИК 18м + иммунитет 25кг (Vidicon)', slug: 'bingo-ik-18m-vidicon', price: 819, stock: 10 },
  { categorySlug: 'datchik-dvizheniya', brandName: 'Arsenal', name: 'Арсенал Рапид Эк Извещатель охранный оптико-электронный ИК пассивный', slug: 'arsenal-rapid-ek', price: 614, stock: 3 },

  // ─── ДАТЧИК РАЗМЫКАНИЯ ────────────────────────────────────────────────────────
  { categorySlug: 'datchik-razmykaniya', brandName: 'Generic', name: 'Датчик Магнитоконтактный ИО 102-60 Б2П', slug: 'datchik-io-102-60-b2p', price: 358, stock: 1 },
  { categorySlug: 'datchik-razmykaniya', brandName: 'Arsenal', name: 'Арсенал ИО-102-32 Полюс-2 Извещатель охранный магнитоконтактный СМК', slug: 'arsenal-io-102-32-polyus-2', price: 297, stock: 20 },

  // ─── ДАТЧИК ДЫМА ──────────────────────────────────────────────────────────────
  { categorySlug: 'datchik-dyma', brandName: 'Generic', name: 'ИП 212-141 Извещатель пожарный дымовой', slug: 'ip-212-141', price: 614, stock: 20 },

  // ─── МОНИТОРЫ ─────────────────────────────────────────────────────────────────
  { categorySlug: 'monitory-aoc', brandName: 'AOC', name: 'Монитор AOC 23.8" 24B30H2 FHD IPS 120Hz LED (1920x1080)', slug: 'aoc-monitor-24b30h2', price: 8500, stock: 1 },
  { categorySlug: 'monitory-dahua', brandName: 'Dahua', name: 'Монитор Dahua Gaming 27" DHI-LM27-B221B FHD IPS 144Hz DisplayPort', slug: 'dahua-monitor-lm27-b221b', price: 10500, stock: 1 },
  { categorySlug: 'monitory-emin', brandName: 'EMIN', name: 'Монитор Emin 27" 100Hz Audio', slug: 'emin-monitor-27-100hz', price: 8500, stock: 0 },
  { categorySlug: 'monitory-emin', brandName: 'EMIN', name: 'Монитор Emin 24" 100Hz Audio', slug: 'emin-monitor-24-100hz', price: 7000, stock: 0 },
  { categorySlug: 'monitory-uniview', brandName: 'Uniview', name: 'Монитор Uniview 24" MW-LC24-P LED VA FHD 100Hz VGA HDMI', slug: 'uniview-monitor-mw-lc24-p', price: 7000, stock: 0 },
  { categorySlug: 'monitory-uniview', brandName: 'Uniview', name: 'Монитор Uniview 27" MW-LC27-S IPS LED FHD 100Hz VGA HDMI', slug: 'uniview-monitor-mw-lc27-s', price: 8000, stock: 0 },
  { categorySlug: 'monitory-imagic', brandName: 'Imagic', name: 'Монитор Imagic 27" MG2761I FHD IPS VGA HDMI', slug: 'imagic-monitor-mg2761i', price: 11000, stock: 0 },
  { categorySlug: 'monitory-dahua', brandName: 'Dahua', name: 'Монитор Dahua 21.5" DHL22-L200 LED FHD VGA HDMI (1920x1080)', slug: 'dahua-monitor-dhl22-l200', price: 5800, stock: 0 },
  { categorySlug: 'monitory-uniview', brandName: 'Uniview', name: 'Монитор Uniview 27" MW-LC27-C IPS LED FHD VGA HDMI', slug: 'uniview-monitor-mw-lc27-c', price: 10500, stock: 0 },
  { categorySlug: 'monitory-philips', brandName: 'PHILIPS', name: 'Монитор Philips б/у 19"', slug: 'philips-monitor-19-bu', price: 3000, stock: 3 },
  { categorySlug: 'monitory-imagic', brandName: 'Imagic', name: 'Монитор Imagic 23.8" MG2461V FHD VGA HDMI 100Hz White', slug: 'imagic-monitor-mg2461v', price: 9000, stock: 1 },
  { categorySlug: 'monitory-imagic', brandName: 'Imagic', name: 'Монитор Imagic 27" MU2798FI FHD VGA HDMI+DC 75Hz', slug: 'imagic-monitor-mu2798fi', price: 10900, stock: 0 },
  { categorySlug: 'monitory-imagic', brandName: 'Imagic', name: 'Монитор Imagic 23.8" MU2493V FHD VGA HDMI+DC 100Hz', slug: 'imagic-monitor-mu2493v', price: 8000, stock: 0 },
  { categorySlug: 'monitory-hikvision', brandName: 'Hikvision', name: 'Монитор Hikvision 21.5" DS-D5022FN00 LED FHD VGA HDMI', slug: 'hikvision-monitor-ds-d5022fn00', price: 5500, stock: 0 },
  { categorySlug: 'monitory-panda', brandName: 'Panda', name: 'Монитор Panda 18" (б/у)', slug: 'panda-monitor-18-bu', price: 3700, stock: 0 },
  { categorySlug: 'monitory-philips', brandName: 'PHILIPS', name: 'Монитор Philips 271 V8B 27" FHD IPS 75Hz', slug: 'philips-monitor-271-v8b', price: 11700, stock: 0 },
  { categorySlug: 'monitory-philips', brandName: 'PHILIPS', name: 'Монитор Philips 241 V8B 24" FHD IPS 75Hz', slug: 'philips-monitor-241-v8b', price: 9000, stock: 0 },
  { categorySlug: 'monitory-aoc', brandName: 'AOC', name: 'Монитор AOC 27" 27B1H2 FHD VA 100Hz HDMI', slug: 'aoc-monitor-27b1h2', price: 12000, stock: 0 },
  { categorySlug: 'monitory-aoc', brandName: 'AOC', name: 'Монитор AOC 23.8" 24B3NM FHD VA 75Hz HDMI VGA', slug: 'aoc-monitor-24b3nm', price: 8500, stock: 0 },

  // ─── НОУТБУКИ HP ──────────────────────────────────────────────────────────────
  { categorySlug: 'noutbuki-hp', brandName: 'HP', name: 'Ноутбук HP Victus 15-FA2082wm Core i5-13420H 15.6" FHD IPS 144Hz 16GB 512GB RTX4050 6GB', slug: 'hp-victus-15-fa2082wm', price: 78000, stock: 1 },
  { categorySlug: 'noutbuki-hp', brandName: 'HP', name: 'Ноутбук HP 15-fd0133wm Core i3-N305 15.6" FHD IPS 8GB 512GB WiFi6', slug: 'hp-15-fd0133wm', price: 39500, stock: 1 },

  // ─── НОУТБУКИ ASUS ────────────────────────────────────────────────────────────
  { categorySlug: 'noutbuki-asus', brandName: 'Asus', name: 'Ноутбук Asus Vivobook 14 X1404VAP Core 5-120U 14" FHD IPS 8GB 256GB WiFi6', slug: 'asus-vivobook-14-x1404vap', price: 42000, stock: 1 },
  { categorySlug: 'noutbuki-asus', brandName: 'Asus', name: 'ASUS VivoBook 15.6" FHD i5-1235U 16GB 512GB Quiet Blue', slug: 'asus-vivobook-15-i5-1235u-16gb', price: 39000, stock: 0 },
  { categorySlug: 'noutbuki-asus', brandName: 'Asus', name: 'Ноутбук Asus ExpertBook B1402CBA Core i5-1235U 14" FHD 16GB 256GB', slug: 'asus-expertbook-b1402cba', price: 47000, stock: 0 },
  { categorySlug: 'noutbuki-asus', brandName: 'Asus', name: 'Ноутбук Asus Vivobook 14 E1404GA-NK053W Core i3-N305 14" FHD 8GB 256GB', slug: 'asus-vivobook-14-e1404ga', price: 31000, stock: 0 },

  // ─── НОУТБУКИ LENOVO ──────────────────────────────────────────────────────────
  { categorySlug: 'noutbuki-lenovo', brandName: 'Lenovo', name: 'Ноутбук Lenovo IdeaPad Slim 1i Core i5-1335U 15.6" FHD Touch 12GB 512GB WiFi6', slug: 'lenovo-ideapad-slim-1i-83b40006us', price: 47000, stock: 1 },

  // ─── НОУТБУКИ ACER ────────────────────────────────────────────────────────────
  { categorySlug: 'noutbuki-acer', brandName: 'Acer', name: 'Ноутбук Acer Aspire 5 A515-57G Core i5-1235U 15.6" FHD 8GB 512GB RTX2050 4GB', slug: 'acer-aspire-5-a515-57g', price: 51000, stock: 0 },
  { categorySlug: 'noutbuki-acer', brandName: 'Acer', name: 'Ноутбук Acer Aspire 3 Ultra Slim A325-42 AMD Ryzen5 7430U 15.6" FHD 8GB 512GB', slug: 'acer-aspire-3-ultra-a325-42', price: 38700, stock: 0 },
  { categorySlug: 'noutbuki-acer', brandName: 'Acer', name: 'Ноутбук Acer Aspire Lite 14 Core 3-N355 14" WUXGA IPS 8GB 256GB WiFi6', slug: 'acer-aspire-lite-14-32p-32ls', price: 31000, stock: 0 },
];

async function main() {
  console.log('Cleaning old data...');
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productSpec.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  console.log('Old data cleared.\n');

  console.log('Creating categories...');
  const categoryMap = new Map<string, number>();
  for (const cat of CATEGORIES) {
    const parent = await prisma.category.create({
      data: { name: cat.name, slug: cat.slug },
    });
    categoryMap.set(cat.slug, parent.id);
    console.log(`  ✓ ${cat.name}`);
    for (const sub of cat.subs ?? []) {
      const child = await prisma.category.create({
        data: { name: sub.name, slug: sub.slug, parentId: parent.id },
      });
      categoryMap.set(sub.slug, child.id);
      console.log(`      • ${sub.name}`);
    }
  }

  console.log('\nCreating brands...');
  const brandMap = new Map<string, number>();
  const brandNames = [...new Set(PRODUCTS.map((p) => p.brandName))];
  for (const name of brandNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const brand = await prisma.brand.create({ data: { name, slug } });
    brandMap.set(name, brand.id);
    console.log(`  ✓ ${name}`);
  }

  console.log('\nCreating products...');
  let count = 0;
  for (const p of PRODUCTS) {
    const categoryId = categoryMap.get(p.categorySlug);
    const brandId = brandMap.get(p.brandName);
    if (!categoryId) {
      console.warn(`  ⚠ Category not found: ${p.categorySlug}`);
      continue;
    }
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description ?? null,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        stock: p.stock,
        categoryId,
        brandId: brandId ?? null,
        images: {
          create: [{ url: `https://placehold.co/400x300/1a2f5e/ffffff?text=${encodeURIComponent(p.name.split(' ').slice(0, 2).join('+')).slice(0, 40)}`, isMain: true }],
        },
      },
    });
    count++;
    if (count % 20 === 0) console.log(`  ... ${count} products created`);
  }

  console.log(`\n✅ Done! Created:`);
  console.log(`   ${CATEGORIES.length} main categories`);
  console.log(`   ${CATEGORIES.reduce((s, c) => s + (c.subs?.length ?? 0), 0)} subcategories`);
  console.log(`   ${brandNames.length} brands`);
  console.log(`   ${count} products`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
