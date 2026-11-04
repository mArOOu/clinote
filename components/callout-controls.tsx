"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18n";

/** Expand/collapse-all for foldable callouts, and opens a collapsed section when linked via #hash or anchor click. */
export function CalloutControls({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const openElement = (id: string, smooth = false) => {
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      let node: HTMLElement | null = el;
      while (node) {
        if (node instanceof HTMLDetailsElement) {
          node.open = true;
          node.setAttribute("open", "");
        }
        node = node.parentElement;
      }
      el.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
    };

    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      openElement(id, false);
    };

    openFromHash();
    window.addEventListener("hashchange", openFromHash);

    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const id = decodeURIComponent(href.slice(1));
      openElement(id, true);
    };
    document.addEventListener("click", handleAnchorClick);

    return () => {
      window.removeEventListener("hashchange", openFromHash);
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  const setAll = (open: boolean) => {
    if (!ref.current) return;
    const items = ref.current.querySelectorAll<HTMLDetailsElement>("details");
    items.forEach((d) => {
      d.open = open;
      if (open) {
        d.setAttribute("open", "");
      } else {
        d.removeAttribute("open");
      }
    });
  };

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
