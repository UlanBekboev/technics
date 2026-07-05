'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/store/toast';

export default function ToastContainer() {
  const { toasts, remove } = useToastStore();

  return (
    <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} id={t.id} message={t.message} type={t.type} onClose={remove} />
      ))}
    </div>
  );
}

function ToastItem({ id, message, type, onClose }: {
  id: number; message: string; type: string; onClose: (id: number) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in
    const t1 = setTimeout(() => setVisible(true), 10);
    // Fade out before remove
    const t2 = setTimeout(() => setVisible(false), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const styles = {
    success: { bg: 'bg-gray-900', icon: <CheckCircle size={17} className="text-green-400 flex-shrink-0" /> },
    error:   { bg: 'bg-gray-900', icon: <XCircle size={17} className="text-red-400 flex-shrink-0" /> },
    info:    { bg: 'bg-gray-900', icon: <Info size={17} className="text-blue-400 flex-shrink-0" /> },
  }[type as 'success' | 'error' | 'info'] ?? { bg: 'bg-gray-900', icon: <CheckCircle size={17} className="text-green-400 flex-shrink-0" /> };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium max-w-xs transition-all duration-300 ${styles.bg} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      {styles.icon}
      <span className="flex-1">{message}</span>
      <button onClick={() => onClose(id)} className="text-white/40 hover:text-white/80 transition-colors ml-1">
        <X size={14} />
      </button>
    </div>
  );
}
