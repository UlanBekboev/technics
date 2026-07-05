"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { adminGetMessages, adminMarkMessageRead, adminDeleteMessage, adminReplyMessage } from "@/lib/api";
import { MessageSquare, Phone, Trash2, Clock, CheckCircle, Send, ChevronDown, ChevronUp } from "lucide-react";

type Message = {
  id: number;
  name: string;
  phone: string;
  message?: string;
  reply?: string;
  repliedAt?: string;
  isRead: boolean;
  createdAt: string;
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  return `${d} дн назад`;
}

function MessageCard({
  msg,
  onRead,
  onDelete,
  onReply,
}: {
  msg: Message;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
  onReply: (id: number, text: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(!msg.isRead);
  const [replyText, setReplyText] = useState(msg.reply ?? "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(!!msg.reply);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!msg.isRead) onRead(msg.id);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await onReply(msg.id, replyText.trim());
      setSent(true);
    } catch {
      alert("Ошибка отправки ответа");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="rounded-2xl border bg-white transition-shadow"
      style={{ borderColor: msg.isRead ? "hsl(var(--border))" : "#3b82f6", boxShadow: msg.isRead ? undefined : "0 0 0 2px #bfdbfe" }}
    >
      {/* Header row */}
      <button
        type="button"
        className="flex w-full items-center gap-3 p-4 text-left"
        onClick={handleOpen}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
          {msg.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{msg.name}</span>
            {!msg.isRead && (
              <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white">NEW</span>
            )}
            {msg.reply && (
              <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">Отвечено</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <Phone className="h-3 w-3" />
            <span>{msg.phone}</span>
            <span>·</span>
            <Clock className="h-3 w-3" />
            <span>{timeAgo(msg.createdAt)}</span>
            {msg.message && <span>· {msg.message.slice(0, 40)}{msg.message.length > 40 ? "…" : ""}</span>}
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>

      {/* Expanded body */}
      {open && (
        <div className="border-t px-4 pb-4 pt-3 space-y-4" style={{ borderColor: "hsl(var(--border))" }}>
          {/* Client message */}
          {msg.message && (
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Сообщение клиента</p>
              <div className="rounded-xl bg-secondary p-3 text-sm leading-relaxed">{msg.message}</div>
            </div>
          )}

          {/* Admin reply already sent */}
          {sent && replyText && (
            <div>
              <p className="mb-1 text-xs font-semibold text-green-600 uppercase tracking-wide flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Ваш ответ
              </p>
              <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm leading-relaxed text-green-900">
                {replyText}
              </div>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-1 text-xs text-muted-foreground underline"
              >
                Изменить ответ
              </button>
            </div>
          )}

          {/* Reply form */}
          {!sent && (
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ваш ответ</p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Напишите ответ клиенту..."
                rows={3}
                className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                style={{ borderColor: "hsl(var(--border))" }}
              />
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onDelete(msg.id)}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Удалить
                </button>
                <button
                  type="button"
                  onClick={handleReply}
                  disabled={sending || !replyText.trim()}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {sending ? "Отправляем..." : "Отправить ответ"}
                </button>
              </div>
            </div>
          )}

          {sent && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onDelete(msg.id)}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" /> Удалить
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminMessagesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "replied">("all");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "ADMIN") { router.push("/"); return; }
    adminGetMessages().then((data) => { setMessages(data); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  const handleRead = async (id: number) => {
    await adminMarkMessageRead(id).catch(() => {});
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, isRead: true } : m));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить сообщение?")) return;
    await adminDeleteMessage(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleReply = async (id: number, text: string) => {
    await adminReplyMessage(id, text);
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, reply: text, isRead: true } : m));
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.isRead;
    if (filter === "replied") return !!m.reply;
    return true;
  });

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Сообщения
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-500 px-2 py-0.5 text-sm font-bold text-white">{unreadCount}</span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{messages.length} сообщений всего</p>
        </div>

        <div className="flex rounded-xl border overflow-hidden text-sm" style={{ borderColor: "hsl(var(--border))" }}>
          {(["all", "unread", "replied"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 font-medium transition-colors"
              style={{
                background: filter === f ? "hsl(var(--primary))" : "white",
                color: filter === f ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
              }}
            >
              {f === "all" ? "Все" : f === "unread" ? `Новые${unreadCount > 0 ? ` (${unreadCount})` : ""}` : "Отвечено"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-secondary animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <MessageSquare className="mb-3 h-12 w-12 opacity-20" />
          <p className="text-sm font-medium">{filter === "unread" ? "Нет новых сообщений" : "Нет сообщений"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <MessageCard
              key={msg.id}
              msg={msg}
              onRead={handleRead}
              onDelete={handleDelete}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
