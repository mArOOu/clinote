"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { SearchDialog } from "./search";

/** Hero search trigger for the landing page; also wires Ctrl/Cmd+K and "/". */
export function LandingSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button type="button" className="hero-search" onClick={() => setOpen(true)}>
        <Search size={18} aria-hidden />
        <span className="flex-1 text-left">Search a condition, drug or tag…</span>
        <kbd className="search-kbd">Ctrl K</kbd>
      </button>
      <SearchDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
