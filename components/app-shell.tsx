"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import type { TreeFolder } from "@/lib/library";
import { SearchDialog } from "./search";
import { SpecialtyIcon } from "./specialty-icon";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { KindDot } from "./kind-badge";
import { useTranslation } from "@/lib/i18n";

function FolderNode({ folder, depth, pathname }: { folder: TreeFolder; depth: number; pathname: string }) {
  const { isFr, t, tSpecialty } = useTranslation();
  const containsActive =
    pathname === `/f/${folder.slug}` ||
    pathname.startsWith(`/f/${folder.slug}/`) ||
    folder.notes.some((n) => pathname === `/n/${n.slug}`) ||
    pathname.startsWith(`/n/${folder.slug}/`);
  const [open, setOpen] = useState(containsActive || depth === 0);
  const [prevActive, setPrevActive] = useState(containsActive);
  if (containsActive !== prevActive) {
    setPrevActive(containsActive);
    if (containsActive) setOpen(true);
  }

  const folderTitle = tSpecialty(folder.title);

  return (
    <li>
      <div className="tree-row" style={{ paddingLeft: depth * 12 }}>
        <Link
          href={`/f/${folder.slug}`}
          className="tree-link tree-folder"
          data-active={pathname === `/f/${folder.slug}`}
          onClick={() => {
            if (!open) setOpen(true);
          }}
        >
          <SpecialtyIcon name={folder.title} className="tree-icon" />
          <span className="truncate flex-1">{folderTitle}</span>
          <span className="tree-count">{folder.count}</span>
        </Link>
        <button
          type="button"
          aria-label={open ? `${t("collapse")} ${folderTitle}` : `${t("expand")} ${folderTitle}`}
          aria-expanded={open}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
          className="tree-chevron"
        >
          <ChevronDown
            size={16}
            className={`tree-chevron-icon ${open ? "tree-chevron-open" : "tree-chevron-closed"}`}
            aria-hidden
          />
        </button>
      </div>
      {open && (
        <ul>
          {folder.folders.map((f) => (
            <FolderNode key={f.slug} folder={f} depth={depth + 1} pathname={pathname} />
          ))}
          {folder.notes.map((n) => {
            const noteTitle = isFr && n.frTitle ? n.frTitle : n.title;
            return (
              <li key={n.slug} style={{ paddingLeft: depth * 12 }}>
                <Link href={`/n/${n.slug}`} className="tree-link tree-note" data-active={pathname === `/n/${n.slug}`}>
                  <KindDot kind={n.kind} />
                  <span className="truncate">{noteTitle}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

function Nav({ tree, pathname }: { tree: TreeFolder; pathname: string }) {
  const { isFr } = useTranslation();
  return (
    <nav aria-label="Library" className="px-2 pb-6">
      <ul>
        {tree.folders.map((f) => (
          <FolderNode key={f.slug} folder={f} depth={0} pathname={pathname} />
        ))}
        {tree.notes.map((n) => {
          const noteTitle = isFr && n.frTitle ? n.frTitle : n.title;
          return (
            <li key={n.slug}>
              <Link href={`/n/${n.slug}`} className="tree-link tree-note" data-active={pathname === `/n/${n.slug}`}>
                <KindDot kind={n.kind} />
                <span className="truncate">{noteTitle}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({ tree, children }: { tree: TreeFolder; children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setDrawer(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "Escape") {
        setDrawer(false);
      }
    };
    const onOpenSearch = () => setSearchOpen(true);

    window.addEventListener("keydown", onKey);
    window.addEventListener("clinote-open-search", onOpenSearch);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("clinote-open-search", onOpenSearch);
    };
  }, []);

  const brand = (
    <Link href="/library" className="brand">
      <span className="brand-mark" aria-hidden />
      Clinote
    </Link>
  );

  return (
    <div className="shell">
      <aside className="sidebar" data-open={drawer}>
        <div className="sidebar-head">
          {brand}
          <button type="button" className="icon-btn sidebar-close" onClick={() => setDrawer(false)} aria-label={t("closeMenu")}>
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="px-3 pb-3">
          <button type="button" className="search-trigger" onClick={() => setSearchOpen(true)}>
            <Search size={14} aria-hidden />
            <span className="flex-1 text-left">{t("searchNotes")}</span>
            <kbd className="search-kbd">Ctrl K</kbd>
          </button>
        </div>
        <div className="sidebar-scroll">
          <Nav tree={tree} pathname={pathname} />
        </div>
        <div className="sidebar-foot">
          <div className="sidebar-foot-row">
            <Link href="/" className="sidebar-foot-link">
              {t("about")}
            </Link>
            <div className="sidebar-foot-actions">
              <LanguageToggle compact />
              <ThemeToggle />
            </div>
          </div>
          <p className="sidebar-foot-author">
            &copy; Marouane Mebarek Falouti
          </p>
          <p className="sidebar-foot-disclaimer">
            {t("disclaimer")}
          </p>
        </div>
      </aside>
      {drawer && <div className="scrim" onClick={() => setDrawer(false)} aria-hidden />}

      <div className="main-col">
        <header className="topbar">
          <button type="button" className="icon-btn" onClick={() => setDrawer(true)} aria-label={t("openMenu")}>
            <Menu size={18} aria-hidden />
          </button>
          {brand}
          <div className="topbar-actions">
            <LanguageToggle />
            <button type="button" className="icon-btn" onClick={() => setSearchOpen(true)} aria-label={t("search")}>
              <Search size={18} aria-hidden />
            </button>
          </div>
        </header>
        <main id="main" className="main">
          {children}
        </main>
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
