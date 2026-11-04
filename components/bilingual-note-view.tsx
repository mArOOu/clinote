"use client";

import Link from "next/link";
import type { Note } from "@/lib/library";
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
  const { isFr: preferredIsFr, t, tSpecialty } = useTranslation();

  const isFr = preferredIsFr && hasFr;
  const currentTitle = isFr ? note.fr!.title : note.title;
  const currentOutline = isFr ? outlineFr : outlineEn;
  const currentUpdatedAt = isFr && note.fr?.updatedAt ? note.fr.updatedAt : note.updatedAt;
  const subPathologies = isFr && note.fr?.subPathologies?.length ? note.fr.subPathologies : note.subPathologies;

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

          {subPathologies.length > 0 && (
            <dl className="meta-list">
              <dt>{t("includes")}</dt>
              <dd>{subPathologies.join(" · ")}</dd>
            </dl>
          )}

          {compare.length > 0 && (
            <dl className="meta-list">
              <dt>{t("compareWith")}</dt>
              <dd>
                {compare.map((c, i) => (
                  <span key={c.name}>
                    {i > 0 && " · "}
                    {c.note ? (
                      <Link href={`/n/${c.note.slug}`}>{c.name}</Link>
                    ) : (
                      <span className="muted">{c.name}</span>
                    )}
                  </span>
                ))}
              </dd>
            </dl>
          )}
        </header>

        {/* Mobile Outline: Collapsible, hidden on desktop via CSS */}
        {currentOutline.length > 2 && (
          <details className="toc-mobile">
            <summary>{t("jumpToSection")}</summary>
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
