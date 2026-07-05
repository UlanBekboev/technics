"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, CheckCircle, Phone, RefreshCw } from "lucide-react";
import { sendMessage, getMessageStatus } from "@/lib/api";
import { useSiteSettings } from "@/context/SiteSettingsContext";

type Stage = "loading" | "form" | "sent" | "replied";

const LS_KEY = "chat_msg_id";

function formatPhone(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 12);
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("loading");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [reply, setReply] = useState("");
  const [checking, setChecking] = useState(false);
  const [hasReplyNotif, setHasReplyNotif] = useState(false);
  const savedId = useRef<number | null>(null);
  const s = useSiteSettings();
  const sitePhone = s.sitePhone || "0704 44 33 33";
  const sitePhoneHref = "tel:" + sitePhone.replace(/\s/g, "").replace(/^0/, "+996");
  const whatsapp = s.siteWhatsapp
    ? `https://wa.me/${s.siteWhatsapp.replace(/\D/g, "")}`
    : "https://wa.me/996704443333";

  // On mount: check localStorage and validate message status
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      setStage("form");
      return;
    }
    const id = Number(raw);
    savedId.current = id;
    // Validate and check if reply exists
    getMessageStatus(id)
      .then((data) => {
        if (!data) {
          // Message was deleted — reset
          localStorage.removeItem(LS_KEY);
          savedId.current = null;
          setStage("form");
        } else if (data.reply) {
          setReply(data.reply);
          setHasReplyNotif(true);
          setStage("replied");
        } else {
          setStage("sent");
        }
      })
      .catch(() => {
        // Network / server error — assume message still exists, show "sent"
        setStage("sent");
      });
  }, []);

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) setHasReplyNotif(false);
    // Auto-check when opening in "sent" state
    if (next && stage === "sent" && savedId.current) {
      checkReply();
    }
  };

  const checkReply = async () => {
    if (!savedId.current) return;
    setChecking(true);
    try {
      const data = await getMessageStatus(savedId.current);
      if (!data) {
        localStorage.removeItem(LS_KEY);
        savedId.current = null;
        setStage("form");
      } else if (data.reply) {
        setReply(data.reply);
        setStage("replied");
      }
    } catch {
      // Network / server error — keep localStorage, stay in "sent", user can retry
    }
    setChecking(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !text.trim()) return;
    setSending(true);
    try {
      const data = await sendMessage({ name: name.trim(), phone: phone.trim(), message: text.trim() });
      savedId.current = data.id;
      localStorage.setItem(LS_KEY, String(data.id));
      setStage("sent");
    } catch {
      alert("Ошибка отправки. Попробуйте позже.");
    }
    setSending(false);
  };

  const handleNewMessage = () => {
    localStorage.removeItem(LS_KEY);
    savedId.current = null;
    setName("");
    setPhone("");
    setText("");
    setReply("");
    setHasReplyNotif(false);
    setStage("form");
  };

  // Don't render anything until localStorage is checked
  if (stage === "loading") return null;

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-20 right-4 z-50 w-80 rounded-2xl border bg-white shadow-2xl sm:right-6"
          style={{ borderColor: "hsl(var(--border))" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between rounded-t-2xl px-4 py-3"
            style={{ background: "linear-gradient(135deg,#003d8f,#0077e6)" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">TECHNICS</p>
                <p className="text-[10px] text-white/70 mt-0.5">
                  {stage === "replied" ? "Ответ получен" : "Напишите нам"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            {/* FORM */}
            {stage === "form" && (
              <form onSubmit={handleSend} className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Оставьте сообщение — мы ответим в ближайшее время.
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя *"
                  required
                  className="h-9 w-full rounded-xl border px-3 text-sm outline-none focus:border-blue-400"
                  style={{ borderColor: "hsl(var(--border))" }}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="Телефон * (+996...)"
                  required
                  className="h-9 w-full rounded-xl border px-3 text-sm outline-none focus:border-blue-400"
                  style={{ borderColor: "hsl(var(--border))" }}
                />
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ваш вопрос или комментарий *"
                  required
                  rows={3}
                  className="w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-400"
                  style={{ borderColor: "hsl(var(--border))" }}
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
                  style={{ background: "linear-gradient(135deg,#003d8f,#0077e6)" }}
                >
                  <Send className="h-4 w-4" />
                  {sending ? "Отправляем..." : "Отправить"}
                </button>
                <div className="flex items-center justify-center gap-3 border-t pt-3" style={{ borderColor: "hsl(var(--border))" }}>
                  <a href={sitePhoneHref} className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                    <Phone className="h-3 w-3" /> {sitePhone}
                  </a>
                  <span className="text-muted-foreground">·</span>
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 font-medium hover:underline">
                    WhatsApp
                  </a>
                </div>
              </form>
            )}

            {/* SENT — waiting for reply */}
            {stage === "sent" && (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                    <CheckCircle className="h-7 w-7 text-blue-500" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-sm">Сообщение отправлено!</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Мы ответим вам в ближайшее время.
                  </p>
                </div>
                <button
                  onClick={checkReply}
                  disabled={checking}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50"
                  style={{ borderColor: "hsl(var(--border))" }}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} />
                  {checking ? "Проверяем..." : "Проверить ответ"}
                </button>
                <button onClick={handleNewMessage} className="w-full text-xs text-muted-foreground underline">
                  Написать новое сообщение
                </button>
              </div>
            )}

            {/* REPLIED */}
            {stage === "replied" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-semibold">Ответ получен!</span>
                </div>
                <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm leading-relaxed text-green-900">
                  {reply}
                </div>
                <div className="flex items-center justify-center gap-3 border-t pt-3" style={{ borderColor: "hsl(var(--border))" }}>
                  <a href={sitePhoneHref} className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                    <Phone className="h-3 w-3" /> Позвонить
                  </a>
                  <span className="text-muted-foreground">·</span>
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 font-medium hover:underline">
                    WhatsApp
                  </a>
                </div>
                <button
                  onClick={handleNewMessage}
                  className="w-full rounded-xl border py-2 text-xs font-semibold hover:bg-secondary transition-colors"
                  style={{ borderColor: "hsl(var(--border))" }}
                >
                  Написать ещё
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={handleOpen}
        aria-label="Открыть чат"
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 sm:right-6"
        style={{ background: "linear-gradient(135deg,#003d8f,#0077e6)" }}
      >
        {open ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6 text-white" />
            {/* Badge only when there's a confirmed reply to show */}
            {hasReplyNotif && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-400 text-[9px] font-bold text-white">
                1
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
