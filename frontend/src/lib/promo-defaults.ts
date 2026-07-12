import type { PromoCamera } from "./settings";

export const EZVIZ_CAMERAS_DEFAULT: PromoCamera[] = [
  {
    name: "EZVIZ H6c Pro",
    type: "Кубическая поворотная 2МР",
    image: "https://emin.kg/files/9b29d4867b37401aae450b8c46fbb829",
    price: 2350,
    specs: ["2MP / 1080p", "IR ночь 10м", "Wi-Fi", "MicroSD", "Микрофон + Динамик"],
    slug: "ip-camera-ezviz-h6c-pro1080",
  },
  {
    name: "EZVIZ H6C Pro 3K",
    type: "Кубическая поворотная 5МР",
    image: "https://emin.kg/files/9108eb5fc94d46f99b18d5f79aed7f2e",
    price: 3200,
    specs: ["5MP / 3K", "IR ночь 10м", "Wi-Fi", "MicroSD", "Микрофон + Динамик"],
    slug: "wifi-kamera-ezviz-h6c-pro-3k",
  },
  {
    name: "EZVIZ H8c PRO 3K",
    type: "Уличная поворотная 5МР",
    image: "https://emin.kg/files/1153f9859209440296d7b7c12a59aa33",
    price: 4600,
    specs: ["5MP / 3K", "LED ночь 30м", "Wi-Fi", "MicroSD", "Микрофон + Динамик"],
    slug: "ip-camera-ezviz-h8c-pro-3k",
  },
  {
    name: "EZVIZ H1c",
    type: "Кубическая 2МР внутренняя",
    image: "",
    price: 0,
    specs: ["2MP / 1080p", "IR ночь", "Wi-Fi", "MicroSD", "Magnetic Base"],
  },
];

export const TVT_CAMERAS_DEFAULT: PromoCamera[] = [
  {
    name: "TVT TD-9540S5L-D",
    type: "4MP купольная уличная Dual Illumination",
    image: "",
    specs: ["4MP / 2560×1440", "Dual Illumination", "Микрофон", "IP67", "H.265+"],
  },
  {
    name: "TVT TD-9440S5L-D",
    type: "4MP цилиндрическая уличная",
    image: "",
    specs: ["4MP / 2560×1440", "Dual Illumination", "Микрофон", "IP67", "H.265+"],
  },
];
