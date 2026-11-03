"use client";

import Link from "next/link";
import { Languages } from "lucide-react";
import type { Note, Source } from "@/lib/library";
import { fmtDate } from "@/lib/format";
import { KindBadge } from "@/components/kind-badge";
import { CalloutControls } from "@/components/callout-controls";
import { useTranslation } from "@/lib/i18n";

type OutlineItem = { id: string; text: string; kind: string };

type Crumb = { slug: string; title: string };
type CompareItem = { name: string; note?: { slug: string } };
type RelatedItem = { slug: string; title: string };

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
  const { lang, isFr: preferredIsFr, setLang, t, tSpecialty } = useTranslation();

  const isFr = preferredIsFr && hasFr;
  const currentTitle = isFr ? note.fr!.title : note.title;
  const currentOutline = isFr ? outlineFr : outlineEn;
  const currentSources: Source[] = isFr && note.fr?.sources?.length ? note.fr.sources : note.sources;
  const currentUpdatedAt = isFr && note.fr?.updatedAt ? note.fr.updatedAt : note.updatedAt;

  return (
    <div className="note-layout">
      <article className="note">
        {/* Navigation Breadcrumbs */}
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/library">{t("library")}</Link>
          {crumbs.map((c) => (
            <span key={c.slug}>
              <span aria-hidden> / </span>
              <Link href={`/f/${c.slug}`}>{tSpecialty(c.title)}</Link>
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
              ) : (
                <span className="lang-badge" title={t("onlyEnNotice")}>
                  {preferredIsFr ? "FR indisponible" : "EN only"}
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
                {tSpecialty(d)}
              </span>
            ))}
            {note.tags.map((tTag) => (
              <span key={tTag} className="badge badge-tag">
                #{tTag}
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
        </header>

        {/* Clinical Comparison Strip */}
        {compare.length > 0 && (
          <aside className="compare-strip" aria-label="Clinical comparisons">
            <span className="compare-label">{t("compareWith")}</span>
            <span className="compare-chips">
              {compare.map((c) =>
                c.note ? (
                  <Link key={c.name} href={`/n/${c.note.slug}`} className="compare-chip">
                    {c.name}
                  </Link>
                ) : (
                  <span key={c.name} className="compare-chip compare-chip-stub" title="Note not yet created">
                    {c.name}
                  </span>
                ),
              )}
            </span>
          </aside>
        )}

        {/* Outline / In-page Jump on Mobile */}
        {currentOutline.length > 2 && (
          <nav className="outline" aria-label={t("jumpToSection")}>
            <p className="outline-title">{t("jumpToSection")}</p>
            <ol>
              {currentOutline.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} data-kind={h.kind}>
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Active Note Content */}
        <CalloutControls>
          {isFr ? contentFr : contentEn}
        </CalloutControls>

        {/* Sources */}
        {currentSources.length > 0 ? (
          <section className="sources" aria-labelledby="sources-h">
            <h2 id="sources-h">{t("sourcesTitle")}</h2>
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
            <h2>{t("relatedNotes")}</h2>
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
        <aside className="toc" aria-label={t("onThisPage")}>
          <p>{t("onThisPage")}</p>
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
