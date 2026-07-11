import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <h1 className="text-xl font-bold">Страница не найдена</h1>
      <Link href="/catalog" className="mt-4 inline-block text-primary hover:underline">← Вернуться в каталог</Link>
    </div>
  );
}
