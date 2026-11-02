import Link from "next/link";
import type { Note } from "@/lib/library";
import { fmtDate } from "@/lib/format";
import { KindBadge } from "@/components/kind-badge";

export function NoteRow({ note, showFolder = true }: { note: Note; showFolder?: boolean }) {
  const meta = [
    showFolder && note.folderSlug ? note.folderTitle : "",
    note.tags.slice(0, 3).map((t) => `#${t}`).join(" "),
  ].filter(Boolean);

  return (
    <li>
      <Link href={`/n/${note.slug}`} className="note-row">
        <span className="note-row-title">
          {note.title}
          {note.kind !== "unclassified" && <KindBadge kind={note.kind} />}
        </span>
        <span className="note-row-meta">
          {meta.join(" · ")}
          {note.updatedAt && (
            <>
              {meta.length > 0 && " · "}
              <span className="updated-tag">Updated {fmtDate(note.updatedAt)}</span>
            </>
          )}
        </span>
        {note.excerpt && <span className="note-row-excerpt">{note.excerpt}</span>}
      </Link>
    </li>
  );
}
