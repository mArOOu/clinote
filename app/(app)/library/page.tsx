import Link from "next/link";
import { Siren, Stethoscope } from "lucide-react";
import { getLibrary, noteCountIn } from "@/lib/library";
import { KINDS } from "@/lib/kinds";
import { NoteRow } from "@/components/note-row";
import { SpecialtyIcon } from "@/components/specialty-icon";

export default function LibraryHome() {
  const lib = getLibrary();
  const count = (k: "emergency" | "chronic" | "unclassified") => lib.notes.filter((n) => n.kind === k).length;
  const unclassified = count("unclassified");

  // Only notes whose content really changed (see lib/library.ts, data/note-versions.json).
  const recent = lib.notes
    .filter((n) => n.updatedAt)
    .sort((a, b) => b.updatedAt!.localeCompare(a.updatedAt!) || a.title.localeCompare(b.title))
    .slice(0, 6);

  return (
    <div className="page">
      <h1 className="page-title">Library</h1>
      <p className="page-sub">
        {lib.notes.length} {lib.notes.length === 1 ? "note" : "notes"} · press <kbd>Ctrl K</kbd> or <kbd>/</kbd> to search
      </p>

      {lib.notes.length === 0 ? (
        <p className="empty">
          The library is empty. Add Markdown files to the <code>content/</code> folder; folders become specialties.
        </p>
      ) : (
        <>
          <h2 className="section-label">Browse by type</h2>
          <div className="kind-grid">
            <Link href={KINDS.emergency.href} className="kind-tile kind-emergency">
              <Siren size={22} aria-hidden />
              <span className="kind-tile-text">
                <strong>{KINDS.emergency.plural}</strong>
                <span>{KINDS.emergency.description}</span>
              </span>
              <span className="kind-tile-count">{count("emergency")}</span>
            </Link>
            <Link href={KINDS.chronic.href} className="kind-tile kind-chronic">
              <Stethoscope size={22} aria-hidden />
              <span className="kind-tile-text">
                <strong>{KINDS.chronic.plural}</strong>
                <span>{KINDS.chronic.description}</span>
              </span>
              <span className="kind-tile-count">{count("chronic")}</span>
            </Link>
          </div>
          {unclassified > 0 && (
            <p className="kind-hint">
              <Link href={KINDS.unclassified.href}>
                {unclassified} {unclassified === 1 ? "note is" : "notes are"} not classified yet
              </Link>
            </p>
          )}

          <h2 className="section-label">Specialties</h2>
          <ul className="folder-grid">
            {lib.root.folders.map((f) => (
              <li key={f.slug}>
                <Link href={`/f/${f.slug}`} className="folder-tile">
                  <SpecialtyIcon name={f.title} size={18} className="tile-icon" />
                  <span className="flex-1">{f.title}</span>
                  <span className="tree-count">{noteCountIn(f)}</span>
                </Link>
              </li>
            ))}
          </ul>

          {recent.length > 0 && (
            <>
              <h2 className="section-label">Recently updated</h2>
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
