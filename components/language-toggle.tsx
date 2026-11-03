"use client";

import { Languages } from "lucide-react";
import { useLang, type Lang } from "@/lib/i18n";

export function LanguageToggle({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const { lang, setLang } = useLang();

  return (
    <div
      className={`lang-switcher ${compact ? "lang-switcher-compact" : ""} ${className}`}
      role="group"
      aria-label="Language / Langue"
    >
      <Languages size={13} className="lang-icon" aria-hidden />
      <button
        type="button"
        className="lang-btn"
        data-active={lang === "en"}
        aria-pressed={lang === "en"}
        onClick={() => setLang("en")}
        title="Switch to English"
      >
        EN
      </button>
      <span className="lang-divider" aria-hidden>|</span>
      <button
        type="button"
        className="lang-btn"
        data-active={lang === "fr"}
        aria-pressed={lang === "fr"}
        onClick={() => setLang("fr")}
        title="Passer en français"
      >
        FR
      </button>
    </div>
  );
}
