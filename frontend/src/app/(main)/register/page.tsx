'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { register, getMe } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Пароль должен быть не менее 6 символов'); return; }
    setLoading(true);
    try {
      const { access_token } = await register(form);
      localStorage.setItem('token', access_token);
      const user = await getMe();
      setAuth(user, access_token);
      router.push(redirect);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? '';
      const text = Array.isArray(msg) ? msg.join(' ') : msg;
      setError(text || 'Ошибка регистрации. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Имя',     key: 'name',     type: 'text',     placeholder: 'Иван Иванов' },
    { label: 'Email',   key: 'email',    type: 'email',    placeholder: 'your@email.com' },
    { label: 'Телефон', key: 'phone',    type: 'tel',      placeholder: '+996 500 000 000', optional: true },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">

        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
          style={{ background: 'linear-gradient(135deg, #003d8f, #0077e6)' }}>
          <span className="text-white text-xl font-black">T</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Регистрация</h1>
        <p className="text-gray-400 text-sm mb-6">Создайте аккаунт для покупок</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ label, key, type, placeholder, optional }) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                {label} {optional && <span className="text-gray-400 font-normal">(необязательно)</span>}
              </label>
              <input
                type={type} value={form[key as keyof typeof form]}
                onChange={set(key)} required={!optional} placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 bg-gray-50 transition-all"
              />
            </div>
          ))}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Пароль</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} value={form.password}
                onChange={set('password')} required placeholder="Минимум 6 символов"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 bg-gray-50 transition-all"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full text-white font-semibold py-3.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #003d8f, #0077e6)' }}>
            {loading ? 'Создаём аккаунт...' : 'Создать аккаунт'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Уже есть аккаунт?{' '}
          <Link href={`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="font-medium hover:underline" style={{ color: '#0057B8' }}>
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
