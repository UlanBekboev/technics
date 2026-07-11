"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendMessage } from "@/lib/api";
import { toast } from "@/components/ui/toast";

export function ContactsForm() {
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Заполните имя и телефон");
      return;
    }
    setSending(true);
    try {
      await sendMessage({ name: form.name.trim(), phone: form.phone.trim(), message: form.message.trim() });
      setForm({ name: "", phone: "", message: "" });
      toast.success("Сообщение отправлено", "Мы свяжемся с вами в ближайшее время.");
    } catch {
      toast.error("Не удалось отправить", "Попробуйте позже или позвоните нам.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-bold">Напишите нам</h2>
      <div className="mt-4 space-y-4">
        <div>
          <Label htmlFor="cname" className="mb-1.5 block">Имя</Label>
          <Input id="cname" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="cphone" className="mb-1.5 block">Телефон</Label>
          <Input id="cphone" type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="cmsg" className="mb-1.5 block">Сообщение</Label>
          <textarea
            id="cmsg" rows={4} value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className="flex w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={sending}>
          {sending && <Loader2 className="h-4 w-4 animate-spin" />}
          Отправить
        </Button>
      </div>
    </form>
  );
}
