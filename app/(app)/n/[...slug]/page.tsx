import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLibrary, resolveFolder, resolveNote } from "@/lib/library";
import { Markdown } from "@/components/markdown";
import { CalloutControls } from "@/components/callout-controls";
import { extractOutline } from "@/lib/remark-callouts";
import { PageSkeleton } from "@/components/page-skeleton";

export function generateStaticParams() {
  const notes = getLibrary().notes;
  return notes.length ? notes.map((n) => ({ slug: n.slug.split("/") })) : [{ slug: ["_"] }];
}

export async function generateMetadata({ params }: PageProps<"/n/[...slug]">): Promise<Metadata> {
  const { slug } = await params;
  const note = getLibrary().bySlug.get(slug.join("/"));
  return { title: note?.title ?? "Not found", description: note?.excerpt };
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function NoteContent({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const lib = getLibrary();
  const note = lib.bySlug.get(slug.join("/"));
  if (!note) notFound();

  const outline = extractOutline(note.body);
  const compare = note.compare.map((name) => ({ name, note: resolveNote(lib, name) }));
  const related = note.related
    .map((r) => resolveNote(lib, r))
    .filter((r): r is NonNullable<typeof r> => !!r && r.slug !== note.slug);
  const folderParts = note.folderSlug ? note.folderSlug.split("/") : [];

  return (
    <div className="note-layout">
      <article className="note">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/library">Library</Link>
          {folderParts.map((_, i) => {
            const f = lib.folders.get(folderParts.slice(0, i + 1).join("/"));
            return f ? (
              <span key={f.slug}>
                <span aria-hidden> / </span>
                <Link href={`/f/${f.slug}`}>{f.title}</Link>
              </span>
            ) : null;
          })}
        </nav>

        <header className="note-head">
          <h1>{note.title}</h1>
          {note.aliases.length > 0 && <p className="aliases">Also known as {note.aliases.join(" · ")}</p>}
          <div className="chips">
            {note.disciplines.map((d) => {
              const f = resolveFolder(lib, d);
              return f ? (
                <Link key={d} href={`/f/${f.slug}`} className="badge badge-link">
                  {d}
                </Link>
              ) : (
                <span key={d} className="badge">
                  {d}
                </span>
              );
            })}
            {note.tags.map((t) => (
              <span key={t} className="badge badge-tag">
                #{t}
              </span>
            ))}
            <span className={note.reviewed ? "badge badge-ok" : "badge badge-warn"}>
              {note.reviewed ? `Reviewed ${fmtDate(note.reviewed)}` : "Review date not recorded"}
            </span>
            <span className="badge">Updated {fmtDateTime(note.updatedAt)}</span>
          </div>

          {note.firstAid && (
            <p className="first-aid">
              <span>First Aid</span>
              {note.firstAid}
            </p>
          )}

          {note.subPathologies.length > 0 && (
            <dl className="meta-list">
              <dt>Includes</dt>
              <dd>{note.subPathologies.join(" · ")}</dd>
            </dl>
          )}
          {compare.length > 0 && (
            <dl className="meta-list">
              <dt>Compare with</dt>
              <dd>
                {compare.map((c, i) => (
                  <span key={c.name}>
                    {i > 0 && " · "}
                    {c.note ? <Link href={`/n/${c.note.slug}`}>{c.name}</Link> : <span className="muted">{c.name}</span>}
                  </span>
                ))}
              </dd>
            </dl>
          )}
        </header>

        {outline.length > 2 && (
          <details className="toc-mobile">
            <summary>Jump to section</summary>
            <ul>
              {outline.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`}>{h.text}</a>
                </li>
              ))}
            </ul>
          </details>
        )}

        <CalloutControls>
          <Markdown body={note.body} lib={lib} />
        </CalloutControls>

        {note.sources.length > 0 ? (
          <section className="sources" aria-labelledby="sources-h">
            <h2 id="sources-h">Sources</h2>
            <ul>
              {note.sources.map((s, i) => (
                <li key={i}>
                  <span className={s.kind === "own" ? "badge badge-own" : "badge badge-ref"}>
                    {s.kind === "own" ? "Own notes" : "Reference"}
                  </span>{" "}
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.title}
                    </a>
                  ) : (
                    s.title
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="no-sources">No sources recorded in the frontmatter of this note.</p>
        )}

        {related.length > 0 && (
          <section className="related">
            <h2>Related</h2>
            <ul>
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/n/${r.slug}`}>{r.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="disclaimer">
          Personal study notes. Not independently validated or intended for clinical decision-making. Verify against
          current guidelines. Never store patient-identifiable information.
        </p>
      </article>

      {outline.length > 2 && (
        <aside className="toc" aria-label="On this page">
          <p>On this page</p>
          <ul>
            {outline.map((h) => (
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

export default function NotePage({ params }: PageProps<"/n/[...slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NoteContent params={params} />
    </Suspense>
  );
}