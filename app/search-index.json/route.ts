import { getLibrary } from "@/lib/library";

export function GET() {
  const { notes } = getLibrary();
  const entries = notes.map((n) => ({
    slug: n.slug,
    title: n.title,
    frTitle: n.fr?.title,
    hasFr: !!n.fr,
    folder: n.folderTitle,
    aliases: n.aliases,
    tags: n.tags,
    kind: n.kind,
    text: (n.body + (n.fr ? "\n" + n.fr.body : "")).slice(0, 30000),
  }));
  return Response.json(entries);
}
