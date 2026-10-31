import Link from "next/link";
import { getLibrary, noteCountIn } from "@/lib/library";
import { NoteRow } from "@/components/note-row";
import { SpecialtyIcon } from "@/components/specialty-icon";

export default function LibraryHome() {
  const lib = getLibrary();
  const recent = [...lib.notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);

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

          <h2 className="section-label">Recently updated</h2>
          <ul className="note-list">
            {recent.map((n) => (
              <NoteRow key={n.slug} note={n} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
