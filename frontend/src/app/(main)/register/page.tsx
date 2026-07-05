"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Mail, Lock, Phone } from "lucide-react";
import { register } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Пароль минимум 6 символов"); return; }
    setLoading(true);
    try {
      const data = await register(form);
      setAuth(data.user, data.token);
      router.push("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Ошибка регистрации. Попробуйте другой email.");
    }
    setLoading(false);
  };

  const field = (
    icon: React.ReactNode,
    label: string,
    key: keyof typeof form,
    type = "text",
    placeholder = "",
    extra?: React.ReactNode
  ) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <input
          type={key === "password" ? (showPwd ? "text" : "password") : type}
          value={form[key]}
          onChange={update(key)}
          required={key !== "phone"}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border bg-secondary pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          style={{ borderColor: "hsl(var(--border))" }}
        />
        {extra && <span className="absolute right-3 top-1/2 -translate-y-1/2">{extra}</span>}
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-12">
      <div className="w-full rounded-2xl border bg-white p-8 shadow-sm" style={{ borderColor: "hsl(var(--border))" }}>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-black">T</div>
          <h1 className="text-2xl font-extrabold">Создать аккаунт</h1>
          <p className="mt-1 text-sm text-muted-foreground">TECHNICS · Системы безопасности</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
          {field(<User className="h-4 w-4" />, "Имя", "name", "text", "Ваше имя")}
          {field(<Mail className="h-4 w-4" />, "Email", "email", "email", "your@email.com")}
          {field(<Phone className="h-4 w-4" />, "Телефон (необязательно)", "phone", "tel", "+996 XXX XXX XXX")}
          {field(
            <Lock className="h-4 w-4" />,
            "Пароль",
            "password",
            "password",
            "Минимум 6 символов",
            <button type="button" onClick={() => setShowPwd((v) => !v)} className="text-muted-foreground">
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Регистрируем..." : "Зарегистрироваться"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">Войти</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
