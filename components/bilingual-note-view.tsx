"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Languages } from "lucide-react";
import type { Note, Source } from "@/lib/library";
import { fmtDate } from "@/lib/format";
import { KindBadge } from "@/components/kind-badge";
import { CalloutControls } from "@/components/callout-controls";

type OutlineItem = { id: string; text: string; kind: string };

type Crumb = { slug: string; title: string };
type CompareItem = { name: string; note?: { slug: string } };
type RelatedItem = { slug: string; title: string };

function getLangSnapshot(): "en" | "fr" {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem("clinote-lang") === "fr" ? "fr" : "en";
}

function getServerLangSnapshot(): "en" | "fr" {
  return "en";
}

function subscribeLang(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function BilingualNoteView({
  note,
  outlineEn,
  outlineFr,
  contentEn,
  contentFr,
  compare,
  related,
  crumbs,
}: {
  note: Note;
  outlineEn: OutlineItem[];
  outlineFr: OutlineItem[];
  contentEn: React.ReactNode;
  contentFr?: React.ReactNode;
  compare: CompareItem[];
  related: RelatedItem[];
  crumbs: Crumb[];
}) {
  const hasFr = Boolean(note.fr && contentFr);
  const preferredLang = useSyncExternalStore(subscribeLang, getLangSnapshot, getServerLangSnapshot);
  const [localLang, setLocalLang] = useState<"en" | "fr" | null>(null);

  const lang: "en" | "fr" = localLang ?? (hasFr ? preferredLang : "en");

  const switchLang = (next: "en" | "fr") => {
    setLocalLang(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("clinote-lang", next);
      window.dispatchEvent(new Event("storage"));
    }
  };

  const isFr = lang === "fr" && hasFr;
  const currentTitle = isFr ? note.fr!.title : note.title;
  const currentOutline = isFr ? outlineFr : outlineEn;
  const currentSources: Source[] = isFr && note.fr?.sources?.length ? note.fr.sources : note.sources;
  const currentUpdatedAt = isFr && note.fr?.updatedAt ? note.fr.updatedAt : note.updatedAt;

  return (
    <div className="note-layout">
      <article className="note">
        {/* Navigation Breadcrumbs */}
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/library">Library</Link>
          {crumbs.map((c) => (
            <span key={c.slug}>
              <span aria-hidden> / </span>
              <Link href={`/f/${c.slug}`}>{c.title}</Link>
            </span>
          ))}
        </nav>

        {/* Note Header */}
        <header className="note-head">
          <div className="note-title-row">
            <h1>{currentTitle}</h1>

            {/* Language Switcher */}
            <div className="lang-switcher-wrap">
              {hasFr ? (
                <div className="lang-switcher" role="group" aria-label="Language selection">
                  <Languages size={14} className="lang-icon" aria-hidden />
                  <button
                    type="button"
                    className="lang-btn"
                    data-active={lang === "en"}
                    aria-pressed={lang === "en"}
                    onClick={() => switchLang("en")}
                  >
                    EN
                  </button>
                  <span className="lang-divider" aria-hidden>|</span>
                  <button
                    type="button"
                    className="lang-btn"
                    data-active={lang === "fr"}
                    aria-pressed={lang === "fr"}
                    onClick={() => switchLang("fr")}
                  >
                    FR
                  </button>
                </div>
              ) : (
                <span className="lang-badge" title="Translation not yet available for this note">
                  EN only
                </span>
              )}
            </div>
          </div>

          {note.aliases.length > 0 && (
            <p className="aliases">
              {isFr ? "Aussi connu sous : " : "Also known as "}
              {note.aliases.join(" · ")}
            </p>
          )}

          <div className="chips">
            <KindBadge kind={note.kind} full />
            {note.disciplines.map((d) => (
              <span key={d} className="badge">
                {d}
              </span>
            ))}
            {note.tags.map((t) => (
              <span key={t} className="badge badge-tag">
                #{t}
              </span>
            ))}
            <span className={note.reviewed ? "badge badge-ok" : "badge badge-warn"}>
              {note.reviewed
                ? isFr
                  ? `Revu le ${fmtDate(note.reviewed)}`
                  : `Reviewed ${fmtDate(note.reviewed)}`
                : isFr
                  ? "Date de révision non enregistrée"
                  : "Review date not recorded"}
            </span>
            {currentUpdatedAt && (
              <span className="badge">
                {isFr ? `Mis à jour le ${fmtDate(currentUpdatedAt)}` : `Updated ${fmtDate(currentUpdatedAt)}`}
              </span>
            )}
          </div>

          {note.firstAid && (
            <p className="first-aid">
              <span>{isFr ? "Premiers soins / Urgence" : "First Aid"}</span>
              {note.firstAid}
            </p>
          )}

          {note.subPathologies.length > 0 && (
            <dl className="meta-list">
              <dt>{isFr ? "Sous-pathologies :" : "Includes :"}</dt>
              <dd>{note.subPathologies.join(" · ")}</dd>
            </dl>
          )}

          {compare.length > 0 && (
            <dl className="meta-list">
              <dt>{isFr ? "Diagnostics différentiels :" : "Compare with :"}</dt>
              <dd>
                {compare.map((c, i) => (
                  <span key={c.name}>
                    {i > 0 && " · "}
                    {c.note ? <Link href={`/n/${c.note.slug}`}>{c.name}</Link> : <span className="muted">{c.name}</span>}
                  </span>
                ))}
              </dd>
            </dl>
          )}
        </header>

        {/* Mobile Section Jump */}
        {currentOutline.length > 2 && (
          <details className="toc-mobile">
            <summary>{isFr ? "Aller à la section" : "Jump to section"}</summary>
            <ul>
              {currentOutline.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`}>{h.text}</a>
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Active Note Content */}
        <CalloutControls>
          {isFr ? contentFr : contentEn}
        </CalloutControls>

        {/* Sources */}
        {currentSources.length > 0 ? (
          <section className="sources" aria-labelledby="sources-h">
            <h2 id="sources-h">{isFr ? "Sources & Références" : "Sources"}</h2>
            <ul>
              {currentSources.map((s, i) => (
                <li key={i}>
                  <span className={s.kind === "own" ? "badge badge-own" : "badge badge-ref"}>
                    {s.kind === "own"
                      ? isFr ? "Notes personnelles" : "Own notes"
                      : isFr ? "Référence clinique" : "Reference"}
                  </span>{" "}
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.title}
                    </a>
                  ) : (
                    s.title
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="no-sources">
            {isFr
              ? "Aucune source externe renseignée dans les métadonnées."
              : "No sources recorded in the frontmatter of this note."}
          </p>
        )}

        {/* Related Notes */}
        {related.length > 0 && (
          <section className="related">
            <h2>{isFr ? "Notes associées" : "Related"}</h2>
            <ul>
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/n/${r.slug}`}>{r.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Copyright & Clinical Disclaimer Footer */}
        <footer className="note-footer">
          <p className="note-author">
            &copy; <strong>Marouane Mebarek Falouti</strong> · Clinote
          </p>
          <p className="disclaimer">
            {isFr
              ? "Notes d'étude clinique personnelles. Non validées de façon indépendante pour la décision clinique directe. Toujours vérifier auprès des recommandations en vigueur. Ne jamais enregistrer d'informations de patients identifiables."
              : "Personal study notes. Not independently validated or intended for clinical decision-making. Verify against current guidelines. Never store patient-identifiable information."}
          </p>
        </footer>
      </article>

      {/* Desktop On this page TOC */}
      {currentOutline.length > 2 && (
        <aside className="toc" aria-label="On this page">
          <p>{isFr ? "Sur cette page" : "On this page"}</p>
          <ul>
            {currentOutline.map((h) => (
              <li key={h.id}>
                <a href={`#${h.id}`} data-kind={h.kind}>
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
