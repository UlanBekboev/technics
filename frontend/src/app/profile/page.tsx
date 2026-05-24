'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Package, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { updateProfile, changePassword } from '@/lib/api';

export default function ProfilePage() {
  const { user, setAuth, token, logout } = useAuthStore();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    setName(user.name);
    setPhone(user.phone ?? '');
  }, [user]);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess(false);
    try {
      const updated = await updateProfile({ name, phone: phone || undefined });
      setAuth(updated, token!);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err?.response?.data?.message ?? 'Ошибка сохранения');
    }
    setProfileSaving(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Минимум 6 символов');
      return;
    }
    setPasswordSaving(true);
    setPasswordError('');
    setPasswordSuccess(false);
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message ?? 'Ошибка смены пароля');
    }
    setPasswordSaving(false);
  }

  if (!user) return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Личный кабинет</h1>

        {/* Nav tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { href: '/profile', label: 'Профиль', icon: User, active: true },
            { href: '/orders',  label: 'Заказы',  icon: Package, active: false },
          ].map(({ href, label, icon: Icon, active }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-white border border-gray-200 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon size={15} /> {label}
            </Link>
          ))}
        </div>

        {/* Profile info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Имя</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
              <input
                value={user.email}
                disabled
                className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Телефон</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+996 700 000 000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>

            {profileError && <p className="text-xs text-red-500">{profileError}</p>}

            <button
              type="submit"
              disabled={profileSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}
            >
              {profileSaving
                ? <><Loader2 size={14} className="animate-spin" /> Сохранение...</>
                : profileSuccess
                ? <><Check size={14} /> Сохранено</>
                : 'Сохранить изменения'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={16} className="text-gray-400" />
            <h2 className="text-sm font-bold text-gray-800">Изменить пароль</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Текущий пароль</label>
              <input
                required
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Новый пароль</label>
              <input
                required
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Повторите пароль</label>
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>

            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}

            <button
              type="submit"
              disabled={passwordSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#003d8f,#0077e6)' }}
            >
              {passwordSaving
                ? <><Loader2 size={14} className="animate-spin" /> Смена пароля...</>
                : passwordSuccess
                ? <><Check size={14} /> Пароль изменён</>
                : 'Изменить пароль'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Выход</h2>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
          >
            Выйти из аккаунта
          </button>
        </div>

      </div>
    </div>
  );
}
