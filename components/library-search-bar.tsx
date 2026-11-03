"use client";

import { Search } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function LibrarySearchBar() {
  const { t } = useTranslation();

  const handleOpen = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("clinote-open-search"));
    }
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="library-search-bar"
      aria-label={t("searchPrompt")}
    >
      <Search size={18} className="library-search-icon" aria-hidden />
      <span className="library-search-text">{t("searchPrompt")}</span>
      <span className="library-search-badge" aria-hidden>
        <kbd>Ctrl K</kbd> or <kbd>/</kbd>
      </span>
    </button>
  );
}
