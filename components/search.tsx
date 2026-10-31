"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Entry = {
  slug: string;
  title: string;
  folder: string;
  aliases: string[];
  tags: string[];
  text: string;
};

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function score(e: Entry, terms: string[], tagFilters: string[]): number {
  if (tagFilters.some((t) => !e.tags.some((x) => norm(x) === t))) return -1;
  const title = norm(e.title);
  const aliases = e.aliases.map(norm);
  const tags = e.tags.map(norm);
  const folder = norm(e.folder);
  const text = norm(e.text);
  let total = 0;
  for (const t of terms) {
    let s = 0;
    if (title === t) s = 100;
    else if (aliases.includes(t)) s = 90;
    else if (title.startsWith(t)) s = 70;
    else if (aliases.some((a) => a.startsWith(t))) s = 60;
    else if (title.includes(t)) s = 50;
    else if (tags.some((x) => x.includes(t)) || folder.includes(t)) s = 30;
    else if (text.includes(t)) s = 10;
    else return -1; // every term must match somewhere
    total += s;
  }
  return total;
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [index, setIndex] = useState<Entry[] | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    if (index || error) return;
    fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Entry[]) => setIndex(d))
      .catch(() => setError(true));
  }, [open, index, error]);

  const results = useMemo(() => {
    if (!index) return [];
    const words = norm(query).split(/\s+/).filter(Boolean);
    const tagFilters = words.filter((w) => w.startsWith("#") && w.length > 1).map((w) => w.slice(1));
    const terms = words.filter((w) => !w.startsWith("#"));
    if (!terms.length && !tagFilters.length) return index.slice(0, 8);
    return index
      .map((e) => ({ e, s: score(e, terms, tagFilters) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s || a.e.title.localeCompare(b.e.title))
      .slice(0, 30)
      .map((x) => x.e);
  }, [index, query]);

  if (!open) return null;

  const go = (e: Entry) => {
    onClose();
    setQuery("");
    router.push(`/n/${e.slug}`);
  };

  return (
    <div className="search-overlay" onMouseDown={onClose} role="presentation">
      <div
        className="search-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Search notes"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          else if (e.key === "ArrowDown") {
            e.preventDefault();
            setCursor((c) => Math.min(c + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setCursor((c) => Math.max(c - 1, 0));
          } else if (e.key === "Enter" && results[cursor]) go(results[cursor]);
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCursor(0);
          }}
          placeholder="Search titles, content, #tags…"
          className="search-input"
          aria-label="Search query"
        />
        <ul className="search-results" role="listbox">
          {error && <li className="search-empty">Couldn’t load the search index. Check your connection and try again.</li>}
          {!error && !index && <li className="search-empty">Loading…</li>}
          {index && results.length === 0 && <li className="search-empty">No notes match “{query}”.</li>}
          {results.map((r, i) => (
            <li key={r.slug} role="option" aria-selected={i === cursor}>
              <button
                type="button"
                className="search-item"
                data-active={i === cursor}
                onMouseMove={() => setCursor(i)}
                onClick={() => go(r)}
              >
                <span className="search-title">{r.title}</span>
                <span className="search-meta">
                  {r.folder || "Library"}
                  {r.tags.length > 0 && ` · ${r.tags.slice(0, 3).map((t) => "#" + t).join(" ")}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="search-foot">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
          <span className="ml-auto">Tip: add #tag to filter</span>
        </div>
      </div>
    </div>
  );
}
