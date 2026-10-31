import Link from "next/link";
import type { Note } from "@/lib/library";

export function NoteRow({ note, showFolder = true }: { note: Note; showFolder?: boolean }) {
  return (
    <li>
      <Link href={`/n/${note.slug}`} className="note-row">
        <span className="note-row-title">
          {note.title}
          
        </span>
        <span className="note-row-meta">
          {showFolder && note.folderSlug ? note.folderTitle : ""}
          {showFolder && note.folderSlug && note.tags.length ? " Â· " : ""}
          {note.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}
        </span>
        {note.excerpt && <span className="note-row-excerpt">{note.excerpt}</span>}
      </Link>
    </li>
  );
}

