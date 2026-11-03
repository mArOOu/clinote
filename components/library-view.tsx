"use client";

import Link from "next/link";
import { Siren, Stethoscope } from "lucide-react";
import type { Library, Folder } from "@/lib/library";
import { KINDS } from "@/lib/kinds";
import { NoteRow } from "@/components/note-row";
import { SpecialtyIcon } from "@/components/specialty-icon";
import { LibrarySearchBar } from "@/components/library-search-bar";
import { useTranslation } from "@/lib/i18n";

function noteCountIn(folder: Folder): number {
  return folder.notes.length + folder.folders.reduce((s, f) => s + noteCountIn(f), 0);
}

export function LibraryView({ lib }: { lib: Library }) {
  const { t, tSpecialty } = useTranslation();

  const count = (k: "emergency" | "chronic" | "unclassified") =>
    lib.notes.filter((n) => n.kind === k).length;
  const unclassified = count("unclassified");

  // Only notes whose content really changed (see lib/library.ts, data/note-versions.json).
  const recent = lib.notes
    .filter((n) => n.updatedAt)
    .sort((a, b) => b.updatedAt!.localeCompare(a.updatedAt!) || a.title.localeCompare(b.title))
    .slice(0, 6);

  return (
    <div className="page">
      <h1 className="page-title">{t("library")}</h1>
      <p className="page-sub">{t("librarySub")(lib.notes.length)}</p>

      {/* 1. Top Prominent Search Bar (especially fast on mobile) */}
      <LibrarySearchBar />

      {lib.notes.length === 0 ? (
        <p className="empty">{t("emptyLibrary")}</p>
      ) : (
        <>
          {/* 2. Specialties Grid */}
          <h2 className="section-label">{t("specialties")}</h2>
          <ul className="folder-grid">
            {lib.root.folders.map((f) => (
              <li key={f.slug}>
                <Link href={`/f/${f.slug}`} className="folder-tile">
                  <SpecialtyIcon name={f.title} size={18} className="tile-icon" />
                  <span className="flex-1">{tSpecialty(f.title)}</span>
                  <span className="tree-count">{noteCountIn(f)}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* 3. Emergencies and Primary Care / Chronic Triage Cards */}
          <h2 className="section-label">{t("browseByType")}</h2>
          <div className="kind-grid">
            <Link href={KINDS.emergency.href} className="kind-tile kind-emergency">
              <Siren size={22} aria-hidden />
              <span className="kind-tile-text">
                <strong>{t("emergenciesTitle")}</strong>
                <span>{t("emergenciesDesc")}</span>
              </span>
              <span className="kind-tile-count">{count("emergency")}</span>
            </Link>
            <Link href={KINDS.chronic.href} className="kind-tile kind-chronic">
              <Stethoscope size={22} aria-hidden />
              <span className="kind-tile-text">
                <strong>{t("chronicTitle")}</strong>
                <span>{t("chronicDesc")}</span>
              </span>
              <span className="kind-tile-count">{count("chronic")}</span>
            </Link>
          </div>

          {unclassified > 0 && (
            <p className="kind-hint">
              <Link href={KINDS.unclassified.href}>
                {t("unclassifiedHint")(unclassified)}
              </Link>
            </p>
          )}

          {/* 4. Recently Updated at the bottom */}
          {recent.length > 0 && (
            <>
              <h2 className="section-label">{t("recentlyUpdated")}</h2>
              <ul className="note-list">
                {recent.map((n) => (
                  <NoteRow key={n.slug} note={n} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
