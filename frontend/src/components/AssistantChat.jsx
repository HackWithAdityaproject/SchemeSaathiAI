import { useEffect, useRef, useState } from "react";
import { ArrowUp, LoaderCircle, MessageCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { askAssistant } from "../api.js";

const assistantLanguages = { en: "English", hi: "Hindi", te: "Telugu", kn: "Kannada", ta: "Tamil" };

export default function AssistantChat({ open, onClose }) {
  const { t, i18n } = useTranslation();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const messagesRef = useRef(null);
  const prompts = [
    t("assistantStudentPrompt"),
    t("assistantFarmerPrompt"),
    t("assistantFamilyPrompt"),
    t("assistantApplyPrompt"),
  ];

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open && messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, busy, open]);

  async function sendMessage(value) {
    const prompt = value.trim();
    if (!prompt || busy) return;

    setQuestion("");
    setMessages((current) => [...current, { role: "user", text: prompt }]);
    setBusy(true);
    try {
      const result = await askAssistant(prompt, assistantLanguages[i18n.language] || "English");
      setMessages((current) => [
        ...current,
        { role: "assistant", text: result.answer, aiPowered: Boolean(result.aiPowered) },
      ]);
    } catch (error) {
      const status = error?.response?.status;
      const text = status
        ? t("assistantServerError", { status })
        : t("assistantNetworkError");
      setMessages((current) => [...current, { role: "assistant", text, isError: true }]);
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(question);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 h-[100dvh] w-screen bg-canvas">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-chat-title"
        className="flex h-full flex-col"
      >
        <header className="shrink-0 border-b border-forest/10 bg-white px-4 py-3 sm:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest text-lime">
                <Sparkles size={22} />
              </span>
              <div>
                <h1 id="assistant-chat-title" className="text-lg font-extrabold text-forest">
                  {t("assistantChatTitle")}
                </h1>
                <p className="text-xs text-slate-500">{t("assistantChatSubtitle")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("assistantClose")}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-forest hover:bg-[#eff4e8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf/30"
            >
              <X size={23} />
            </button>
          </div>
        </header>

        <div ref={messagesRef} aria-live="polite" className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-3xl">
            {messages.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eff4e8] text-leaf">
                    <MessageCircle size={20} />
                  </span>
                  <div>
                    <h2 className="font-extrabold text-forest">{t("assistantWelcomeTitle")}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{t("assistantDescription")}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {prompts.map((prompt) => (
                    <button
                      type="button"
                      key={prompt}
                      disabled={busy}
                      onClick={() => sendMessage(prompt)}
                      className="min-h-14 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-forest transition hover:border-leaf hover:bg-[#f5f7f2] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf/30 disabled:opacity-60"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <article
                      className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[78%] ${
                        message.role === "user"
                          ? "bg-forest text-white"
                          : message.isError
                            ? "border border-amber-200 bg-amber-50 text-amber-950"
                            : "border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <p>{message.text}</p>
                      {message.aiPowered !== undefined && (
                        <p className="mt-2 border-t border-slate-200 pt-2 text-xs text-slate-500">
                          {t(message.aiPowered ? "assistantAiMode" : "assistantBasicMode")}
                        </p>
                      )}
                    </article>
                  </div>
                ))}
                {busy && (
                  <p role="status" className="flex items-center gap-2 text-sm font-semibold text-leaf">
                    <LoaderCircle size={17} className="animate-spin" /> {t("assistantThinking")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="shrink-0 border-t border-forest/10 bg-white px-4 py-3 sm:px-8 sm:py-4">
          <div className="mx-auto max-w-3xl">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <label className="sr-only" htmlFor="assistant-chat-input">{t("assistantQuestionLabel")}</label>
              <input
                ref={inputRef}
                id="assistant-chat-input"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                maxLength={500}
                placeholder={t("assistantPlaceholder")}
                className="h-12 min-w-0 flex-1 rounded-xl border border-slate-300 px-4 text-sm text-slate-800 outline-none placeholder:text-slate-500 focus:border-leaf focus:ring-4 focus:ring-leaf/10"
              />
              <button
                type="submit"
                disabled={busy || !question.trim()}
                aria-label={t("ask")}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-forest text-white hover:bg-leaf focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf/30 disabled:opacity-50 sm:w-auto sm:px-5"
              >
                {busy ? <LoaderCircle size={18} className="animate-spin" /> : <><ArrowUp size={18} /><span className="sr-only sm:not-sr-only sm:ml-2">{t("ask")}</span></>}
              </button>
            </form>
            <p className="mt-2 flex items-center gap-1.5 text-xs leading-5 text-slate-500">
              <ShieldCheck size={14} className="shrink-0 text-leaf" /> {t("assistantPrivacy")}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{t("applicationsNote")}</p>
          </div>
        </footer>
      </section>
    </div>
  );
}
