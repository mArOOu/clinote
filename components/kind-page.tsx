import Link from "next/link";
import { CircleHelp, Siren, Stethoscope } from "lucide-react";
import { getLibrary } from "@/lib/library";
import { KINDS, type Kind } from "@/lib/kinds";
import { KindTabs } from "@/components/kind-tabs";
import { NoteRow } from "@/components/note-row";
import { SpecialtyIcon } from "@/components/specialty-icon";

/** All notes of one type, grouped by specialty. */
export function KindPage({ kind }: { kind: Kind }) {
  const lib = getLibrary();
  const notes = lib.notes.filter((n) => n.kind === kind);
  const meta = KINDS[kind];

  const groups = lib.root.folders
    .map((f) => ({
      folder: f,
      notes: notes.filter((n) => n.slug === f.slug || n.slug.startsWith(`${f.slug}/`)),
    }))
    .filter((g) => g.notes.length > 0);
  const rootNotes = notes.filter((n) => !n.folderSlug);

  return (
    <div className="page">
      <h1 className="page-title page-title-icon">
        <span className={`kind-title-icon kind-${kind}`}>
          {kind === "emergency" && <Siren size={26} aria-hidden />}
          {kind === "chronic" && <Stethoscope size={26} aria-hidden />}
          {kind === "unclassified" && <CircleHelp size={26} aria-hidden />}
        </span>
        {meta.plural}
      </h1>
      <p className="page-sub">
        {notes.length} {notes.length === 1 ? "note" : "notes"} · {meta.description}
      </p>

      <KindTabs active={kind} />

      {notes.length === 0 ? (
        <p className="empty">
          {kind === "unclassified" ? (
            <>Every note has a type. Nothing to classify.</>
          ) : (
            <>
              No notes of this type yet. Add <code>Type: {kind === "emergency" ? "Emergency" : "Chronic"}</code> to a
              note&rsquo;s frontmatter, or tag it{" "}
              <code>{kind === "emergency" ? "#Emergency" : "#Outpatient"}</code>.
            </>
          )}
        </p>
      ) : (
        <>
          {groups.map(({ folder, notes: list }) => (
            <section key={folder.slug}>
              <h2 className="section-label group-label">
                <SpecialtyIcon name={folder.title} size={14} className="tile-icon" />
                <Link href={`/f/${folder.slug}`}>{folder.title}</Link>
                <span className="tree-count">{list.length}</span>
              </h2>
              <ul className="note-list">
                {list.map((n) => (
                  <NoteRow key={n.slug} note={n} showFolder={false} />
                ))}
              </ul>
            </section>
          ))}
          {rootNotes.length > 0 && (
            <section>
              <h2 className="section-label group-label">Other</h2>
              <ul className="note-list">
                {rootNotes.map((n) => (
                  <NoteRow key={n.slug} note={n} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
