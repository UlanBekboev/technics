'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { forgotPassword } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError('Ошибка при отправке. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">

        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
          style={{ background: 'linear-gradient(135deg, #003d8f, #0077e6)' }}>
          <span className="text-white text-xl font-black">T</span>
        </div>

        {sent ? (
          <>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <Mail size={22} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Письмо отправлено</h1>
            <p className="text-gray-500 text-sm mb-6">
              Если <span className="font-medium text-gray-700">{email}</span> зарегистрирован,
              мы отправили на него 6-значный код. Проверьте папку «Спам», если письмо не пришло.
            </p>
            <Link
              href={`/reset-password?email=${encodeURIComponent(email)}`}
              className="w-full block text-center text-white font-semibold py-3.5 rounded-xl transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #003d8f, #0077e6)' }}>
              Ввести код
            </Link>
            <button
              onClick={() => setSent(false)}
              className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Изменить email
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Забыли пароль?</h1>
            <p className="text-gray-400 text-sm mb-6">
              Введите email аккаунта — мы пришлём код для сброса пароля
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 bg-gray-50 transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full text-white font-semibold py-3.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #003d8f, #0077e6)' }}>
                {loading ? 'Отправляем...' : 'Отправить код'}
              </button>
            </form>
          </>
        )}

        <Link href="/login"
          className="flex items-center gap-1.5 justify-center text-sm text-gray-400 hover:text-gray-600 transition-colors mt-5">
          <ArrowLeft size={14} />
          Вернуться ко входу
        </Link>
      </div>
    </div>
  );
}
