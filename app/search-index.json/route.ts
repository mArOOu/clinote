import { getLibrary } from "@/lib/library";

export function GET() {
  const { notes } = getLibrary();
  const entries = notes.map((n) => ({
    slug: n.slug,
    title: n.title,
    folder: n.folderTitle,
    aliases: n.aliases,
    tags: n.tags,
    text: n.body.slice(0, 20000),
  }));
  return Response.json(entries);
}
