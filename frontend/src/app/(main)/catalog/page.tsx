import { Suspense } from 'react';
import CatalogContent from './CatalogContent';

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 animate-pulse"><div className="h-8 bg-gray-100 rounded w-48 mb-6" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({length:12}).map((_,i)=><div key={i} className="bg-white rounded-2xl border aspect-[3/4]"/>)}</div></div>}>
      <CatalogContent />
    </Suspense>
  );
}
