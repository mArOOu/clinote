import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLibrary, noteCountIn } from "@/lib/library";
import { KIND_ORDER } from "@/lib/kinds";
import { KindBadge } from "@/components/kind-badge";
import { NoteRow } from "@/components/note-row";
import { FolderHeader } from "@/components/folder-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { SpecialtyIcon } from "@/components/specialty-icon";

export function generateStaticParams() {
  const slugs = [...getLibrary().folders.keys()].filter(Boolean);
  // Cache Components requires at least one sample param.
  return slugs.length ? slugs.map((s) => ({ slug: s.split("/") })) : [{ slug: ["_"] }];
}

export async function generateMetadata({ params }: PageProps<"/f/[...slug]">): Promise<Metadata> {
  const { slug } = await params;
  const folder = getLibrary().folders.get(slug.join("/"));
  return { title: folder?.title ?? "Not found" };
}

async function FolderContent({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const lib = getLibrary();
  const key = slug.join("/");
  const folder = lib.folders.get(key);
  if (!folder || !key) notFound();

  const crumbs = slug
    .map((_, i) => lib.folders.get(slug.slice(0, i + 1).join("/")))
    .filter((f): f is NonNullable<typeof f> => Boolean(f))
    .slice(0, -1)
    .map((f) => ({ slug: f.slug, title: f.title }));

  return (
    <div className="page">
      <FolderHeader folderTitle={folder.title} noteCount={noteCountIn(folder)} crumbs={crumbs} />

      {folder.folders.length > 0 && (
        <>
          <h2 className="section-label">Sections</h2>
          <ul className="folder-grid">
            {folder.folders.map((f) => (
              <li key={f.slug}>
                <Link href={`/f/${f.slug}`} className="folder-tile">
                  <SpecialtyIcon name={f.title} size={18} className="tile-icon" />
                  <span className="flex-1">{f.title}</span>
                  <span className="tree-count">{noteCountIn(f)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {folder.notes.length > 0 ? (
        KIND_ORDER.map((kind) => {
          const list = folder.notes.filter((n) => n.kind === kind);
          if (list.length === 0) return null;
          return (
            <section key={kind}>
              <h2 className="section-label group-label">
                <KindBadge kind={kind} full />
                <span className="tree-count">{list.length}</span>
              </h2>
              <ul className="note-list">
                {list.map((n) => (
                  <NoteRow key={n.slug} note={n} showFolder={false} />
                ))}
              </ul>
            </section>
          );
        })
      ) : (
        folder.folders.length === 0 && <p className="empty">This folder has no notes yet.</p>
      )}
    </div>
  );
}


export default function FolderPage({ params }: PageProps<"/f/[...slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <FolderContent params={params} />
    </Suspense>
  );
}