"use client";

import Link from "next/link";
import type { Note } from "@/lib/library";
import { fmtDate } from "@/lib/format";
import { KindBadge } from "@/components/kind-badge";
import { useTranslation } from "@/lib/i18n";

export function NoteRow({ note, showFolder = true }: { note: Note; showFolder?: boolean }) {
  const { isFr, tSpecialty } = useTranslation();

  const title = isFr && note.fr?.title ? note.fr.title : note.title;
  const folder = showFolder && note.folderTitle ? tSpecialty(note.folderTitle) : "";
  const excerpt = isFr && note.fr?.excerpt ? note.fr.excerpt : note.excerpt;

  const meta = [
    folder,
    note.tags.slice(0, 3).map((t) => `#${t}`).join(" "),
  ].filter(Boolean);

  return (
    <li>
      <Link href={`/n/${note.slug}`} className="note-row">
        <span className="note-row-title">
          {title}
          {note.kind !== "unclassified" && <KindBadge kind={note.kind} />}
        </span>
        <span className="note-row-meta">
          {meta.join(" · ")}
          {note.updatedAt && (
            <>
              {meta.length > 0 && " · "}
              <span className="updated-tag">
                {isFr ? `Mis à jour le ${fmtDate(note.updatedAt)}` : `Updated ${fmtDate(note.updatedAt)}`}
              </span>
            </>
          )}
        </span>
        {excerpt && <span className="note-row-excerpt">{excerpt}</span>}
      </Link>
    </li>
  );
}
