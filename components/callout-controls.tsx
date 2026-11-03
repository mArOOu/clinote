"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18n";

/** Expand/collapse-all for foldable callouts, and opens a collapsed section when linked via #hash. */
export function CalloutControls({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      let node: HTMLElement | null = el;
      while (node) {
        if (node instanceof HTMLDetailsElement) node.open = true;
        node = node.parentElement;
      }
      el?.scrollIntoView({ block: "start" });
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  const setAll = (open: boolean) =>
    ref.current?.querySelectorAll<HTMLDetailsElement>("details.callout").forEach((d) => (d.open = open));

  return (
    <div ref={ref}>
      <div className="fold-controls">
        <button type="button" onClick={() => setAll(true)}>
          {t("expandAll")}
        </button>
        <button type="button" onClick={() => setAll(false)}>
          {t("collapseAll")}
        </button>
      </div>
      {children}
    </div>
  );
}
