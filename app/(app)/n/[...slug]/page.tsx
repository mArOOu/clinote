import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLibrary, resolveNote } from "@/lib/library";
import { Markdown } from "@/components/markdown";
import { extractOutline } from "@/lib/remark-callouts";
import { PageSkeleton } from "@/components/page-skeleton";
import { BilingualNoteView } from "@/components/bilingual-note-view";

export function generateStaticParams() {
  const notes = getLibrary().notes;
  return notes.length ? notes.map((n) => ({ slug: n.slug.split("/") })) : [{ slug: ["_"] }];
}

export async function generateMetadata({ params }: PageProps<"/n/[...slug]">): Promise<Metadata> {
  const { slug } = await params;
  const note = getLibrary().bySlug.get(slug.join("/"));
  return { title: note?.title ?? "Not found", description: note?.excerpt };
}

async function NoteContent({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const lib = getLibrary();
  const note = lib.bySlug.get(slug.join("/"));
  if (!note) notFound();

  const outlineEn = extractOutline(note.body);
  const outlineFr = note.fr ? extractOutline(note.fr.body) : [];
  const compare = note.compare.map((name) => ({ name, note: resolveNote(lib, name) }));
  const related = note.related
    .map((r) => resolveNote(lib, r))
    .filter((r): r is NonNullable<typeof r> => !!r && r.slug !== note.slug);
  const folderParts = note.folderSlug ? note.folderSlug.split("/") : [];
  const crumbs = folderParts
    .map((_, i) => lib.folders.get(folderParts.slice(0, i + 1).join("/")))
    .filter((f): f is NonNullable<typeof f> => !!f)
    .map((f) => ({ slug: f.slug, title: f.title }));

  return (
    <BilingualNoteView
      note={note}
      outlineEn={outlineEn}
      outlineFr={outlineFr}
      contentEn={<Markdown body={note.body} lib={lib} />}
      contentFr={note.fr ? <Markdown body={note.fr.body} lib={lib} /> : undefined}
      compare={compare}
      related={related}
      crumbs={crumbs}
    />
  );
}

export default function NotePage({ params }: PageProps<"/n/[...slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NoteContent params={params} />
    </Suspense>
  );
}
