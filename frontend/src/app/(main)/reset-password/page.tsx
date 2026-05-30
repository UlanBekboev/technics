'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { getMe } from '@/lib/api';

function ResetPasswordForm() {
  const params = useSearchParams();
  const emailParam = params.get('email') || '';
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail]       = useState(emailParam);
  const [code, setCode]         = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [step, setStep]         = useState<'code' | 'password'>('code');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[idx] = val;
    setCode(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleCodeKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const codeValue = code.join('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 'code') {
      if (codeValue.length < 6) {
        setError('Введите 6-значный код');
        return;
      }
      setStep('password');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);
    try {
      const { access_token } = await resetPassword(email, codeValue, password);
      localStorage.setItem('token', access_token);
      const user = await getMe();
      setAuth(user, access_token);
      router.push('/');
    } catch (err: any) {
      const msg = err.response?.data?.message ?? '';
      setError(msg || 'Ошибка. Проверьте код и попробуйте снова.');
      if (msg.includes('код')) setStep('code');
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

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {step === 'code' ? 'Введите код' : 'Новый пароль'}
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          {step === 'code'
            ? <>Код отправлен на <span className="font-medium text-gray-600">{email}</span></>
            : 'Придумайте новый надёжный пароль'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 'code' && (
            <>
              {!emailParam && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    required placeholder="your@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 bg-gray-50 transition-all"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-3">Код подтверждения</label>
                <div className="flex gap-2.5 justify-center" onPaste={handleCodePaste}>
                  {code.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { inputRefs.current[idx] = el; }}
                      type="text" inputMode="numeric" maxLength={1}
                      value={digit}
                      onChange={e => handleCodeChange(idx, e.target.value)}
                      onKeyDown={e => handleCodeKeyDown(idx, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 transition-all"
                      style={{ borderColor: digit ? '#0077e6' : undefined }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 'password' && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Новый пароль</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  placeholder="Минимум 6 символов" autoFocus
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 bg-gray-50 transition-all"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading || (step === 'code' && codeValue.length < 6)}
            className="w-full text-white font-semibold py-3.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #003d8f, #0077e6)' }}>
            {loading ? 'Сохраняем...' : step === 'code' ? 'Далее' : 'Сохранить пароль'}
          </button>

          {step === 'password' && (
            <button type="button" onClick={() => { setStep('code'); setError(''); }}
              className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Изменить код
            </button>
          )}
        </form>

        <Link href="/login"
          className="flex items-center gap-1.5 justify-center text-sm text-gray-400 hover:text-gray-600 transition-colors mt-5">
          <ArrowLeft size={14} />
          Вернуться ко входу
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordForm /></Suspense>;
}
