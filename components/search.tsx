"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { type Kind } from "@/lib/kinds";
import { KindBadge } from "@/components/kind-badge";
import { useTranslation } from "@/lib/i18n";

type Entry = {
  slug: string;
  title: string;
  frTitle?: string;
  hasFr?: boolean;
  folder: string;
  aliases: string[];
  tags: string[];
  text: string;
  kind: Kind;
};

type KindFilter = "all" | "emergency" | "chronic";

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function score(e: Entry, terms: string[], tagFilters: string[]): number {
  if (tagFilters.some((t) => !e.tags.some((x) => norm(x) === t))) return -1;
  const title = norm(e.title);
  const frTitle = e.frTitle ? norm(e.frTitle) : "";
  const aliases = e.aliases.map(norm);
  const tags = e.tags.map(norm);
  const folder = norm(e.folder);
  const text = norm(e.text);
  let total = 0;
  for (const t of terms) {
    let s = 0;
    if (title === t || frTitle === t) s = 100;
    else if (aliases.includes(t)) s = 90;
    else if (title.startsWith(t) || (frTitle && frTitle.startsWith(t))) s = 70;
    else if (aliases.some((a) => a.startsWith(t))) s = 60;
    else if (title.includes(t) || (frTitle && frTitle.includes(t))) s = 50;
    else if (tags.some((x) => x.includes(t)) || folder.includes(t)) s = 30;
    else if (text.includes(t)) s = 10;
    else return -1; // every term must match somewhere
    total += s;
  }
  return total;
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { isFr, t, tSpecialty } = useTranslation();
  const [index, setIndex] = useState<Entry[] | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    inputRef.current?.focus();
    if (index || error) return;
    fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Entry[]) => setIndex(d.map((e) => ({ ...e, kind: e.kind ?? "unclassified" }))))
      .catch(() => setError(true));
  }, [open, index, error]);

  useEffect(() => {
    if (open) return;
    restoreFocusRef.current?.focus();
    restoreFocusRef.current = null;
  }, [open]);

  const results = useMemo(() => {
    if (!index) return [];
    const pool = kindFilter === "all" ? index : index.filter((e) => e.kind === kindFilter);
    const words = norm(query).split(/\s+/).filter(Boolean);
    const tagFilters = words.filter((w) => w.startsWith("#") && w.length > 1).map((w) => w.slice(1));
    const terms = words.filter((w) => !w.startsWith("#"));
    if (!terms.length && !tagFilters.length) return pool.slice(0, 8);
    return pool
      .map((e) => ({ e, s: score(e, terms, tagFilters) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s || a.e.title.localeCompare(b.e.title))
      .slice(0, 30)
      .map((x) => x.e);
  }, [index, query, kindFilter]);

  if (!open) return null;

  const go = (e: Entry) => {
    onClose();
    setQuery("");
    router.push(`/n/${e.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, input, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && results[cursor]) {
      go(results[cursor]);
    }
  };

  const filterLabels: Record<KindFilter, string> = {
    all: t("filterAll"),
    emergency: t("filterEmergencies"),
    chronic: t("filterChronic"),
  };

  return (
    <div className="search-overlay" onMouseDown={onClose} role="presentation">
      <div
        ref={panelRef}
        className="search-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t("searchNotes")}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCursor(0);
          }}
          placeholder={t("searchPlaceholder")}
          className="search-input"
          aria-label={t("searchNotes")}
        />
        <div className="search-filters" role="group" aria-label="Filter by type">
          {(["all", "emergency", "chronic"] as const).map((k) => (
            <button
              key={k}
              type="button"
              className="search-chip"
              data-active={kindFilter === k}
              data-kind={k}
              aria-pressed={kindFilter === k}
              onClick={() => {
                setKindFilter(k);
                setCursor(0);
                inputRef.current?.focus();
              }}
            >
              {filterLabels[k]}
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          {index && !error ? `${results.length} ${results.length === 1 ? "result" : "results"}` : ""}
        </p>
        <ul className="search-results" role="listbox" aria-label="Search results">
          {error && <li className="search-empty">{isFr ? "Impossible de charger l'index de recherche." : "Couldn’t load the search index."}</li>}
          {!error && !index && <li className="search-empty">{isFr ? "Chargement…" : "Loading…"}</li>}
          {index && results.length === 0 && (
            <li className="search-empty">
              {t("noResults")} “{query}”.
            </li>
          )}
          {results.map((r, i) => {
            const title = isFr && r.frTitle ? r.frTitle : r.title;
            const folder = isFr && r.folder ? tSpecialty(r.folder) : (r.folder || t("library"));
            return (
              <li key={r.slug} role="option" aria-selected={i === cursor}>
                <button
                  type="button"
                  className="search-item"
                  data-active={i === cursor}
                  onMouseMove={() => setCursor(i)}
                  onClick={() => go(r)}
                >
                  <span className="search-title">
                    {title}
                    {r.kind !== "unclassified" && <KindBadge kind={r.kind} />}
                  </span>
                  <span className="search-meta">
                    {folder}
                    {r.tags.length > 0 && ` · ${r.tags.slice(0, 3).map((t) => "#" + t).join(" ")}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="search-foot">
          <span>↑↓ {t("searchTipNav")}</span>
          <span>↵ {t("searchTipOpen")}</span>
          <span>{t("searchTipClose")}</span>
          <span className="ml-auto">{isFr ? "Astuce: filtrez avec #tag" : "Tip: add #tag to filter"}</span>
        </div>
      </div>
    </div>
  );
}
