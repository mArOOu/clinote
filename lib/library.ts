import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Filesystem-backed library. Folders under /content are specialties/collections,
 * *.md files are notes. This is the single data-access seam: when Supabase is
 * added, replace the internals of getLibrary() and keep the exported types.
 */

export const CONTENT_DIR = path.join(process.cwd(), "content");

export type Source = { title: string; url?: string; kind: "own" | "reference" };

export type Note = {
  slug: string; // url path, e.g. "cardiology/heart-failure"
  title: string;
  folderSlug: string; // "" for root
  folderTitle: string;
  body: string;
  excerpt: string;
  tags: string[];
  aliases: string[];
  disciplines: string[];
  firstAid: string; // quick-reference line ("" when absent)
  subPathologies: string[];
  compare: string[]; // comparison topics, resolved to notes where possible
  reviewed?: string; // ISO date
  sources: Source[];
  related: string[]; // raw titles from `related:` frontmatter
  updatedAt: string; // ISO, from file mtime
};

export type Folder = {
  slug: string;
  title: string;
  folders: Folder[];
  notes: Note[];
};

export type Library = {
  root: Folder;
  notes: Note[];
  bySlug: Map<string, Note>;
  folders: Map<string, Folder>;
};

export function slugify(input: string): string {
  return (
    input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled"
  );
}

function titleFromName(name: string) {
  return name.replace(/\.md$/i, "").replace(/[-_]+/g, " ").trim();
}

const stripWiki = (s: string) => s.replace(/^\[\[|\]\]$/g, "").split("|")[0].trim();

function parseMatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return matter(raw);

  const frontmatter = match[1].replace(
    /^(\s*[^:#\r\n]+:\s*)(\[\[[^\r\n]+\]\](?:\s*,\s*\[\[[^\r\n]+\]\])*)\s*$/gm,
    '$1"$2"',
  );
  return matter(frontmatter === match[1] ? raw : raw.replace(match[1], frontmatter));
}

function strList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => stripWiki(String(x).trim())).filter(Boolean);
  if (typeof v === "string") return v.split(",").map((x) => stripWiki(x.trim())).filter(Boolean);
  return [];
}

/** Frontmatter lookup tolerant of case, spaces and underscores ("First Aid", "first_aid", "firstAid"). */
function fmGet(fm: Record<string, unknown>, key: string): unknown {
  const k = key.replace(/[\s_-]/g, "").toLowerCase();
  for (const [name, value] of Object.entries(fm)) {
    if (name.replace(/[\s_-]/g, "").toLowerCase() === k) return value;
  }
  return undefined;
}

function firstAidText(v: unknown): string {
  if (typeof v === "string") return stripWiki(v);
  if (Array.isArray(v)) return strList(v).join(", ");
  if (v === true) return "Yes";
  return "";
}

function toIsoDate(v: unknown): string | undefined {
  if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString().slice(0, 10);
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  return undefined;
}

function parseSources(v: unknown): Source[] {
  if (!Array.isArray(v)) return [];
  const out: Source[] = [];
  for (const s of v) {
    if (typeof s === "string") {
      out.push({ title: s, kind: "reference", url: /^https?:\/\//.test(s) ? s : undefined });
    } else if (s && typeof s === "object") {
      const o = s as Record<string, unknown>;
      const url = typeof o.url === "string" && /^https?:\/\//.test(o.url) ? o.url : undefined;
      const title = String(o.title ?? o.url ?? "").trim();
      if (!title) continue;
      out.push({ title, url, kind: o.kind === "own" ? "own" : "reference" });
    }
  }
  return out;
}

/** Callout titles that are never shown (kept in the source files, dropped at load time). */
const HIDDEN_SECTIONS = ["personal experience"];

function stripHiddenSections(body: string): string {
  const out: string[] = [];
  let skipping = false;
  for (const line of body.split(/\r?\n/)) {
    const m = /^>\s*\[![\w-]+\][+-]?[ \t]*(.*)$/.exec(line);
    if (m) skipping = HIDDEN_SECTIONS.includes(m[1].trim().toLowerCase());
    else if (skipping && !/^>/.test(line)) skipping = false;
    if (!skipping) out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

function makeExcerpt(body: string) {
  const text = body
    .replace(/^---[\s\S]*?---/, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#+\s.*$/gm, " ")
    .replace(/^>\s*\[![^\]]*\][+-]?[^\n]*/gm, " ")
    .replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (_, a, __, b) => b ?? a)
    .replace(/\$+/g, " ")
    .replace(/[*_`>#|\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 180 ? text.slice(0, 177).trimEnd() + "…" : text;
}

function readFolder(dir: string, slugParts: string[], title: string, notes: Note[]): Folder {
  const folder: Folder = { slug: slugParts.join("/"), title, folders: [], notes: [] };
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => !e.name.startsWith(".") && !e.name.startsWith("_"))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      folder.folders.push(readFolder(full, [...slugParts, slugify(e.name)], e.name, notes));
    } else if (e.isFile() && /\.md$/i.test(e.name)) {
      const raw = fs.readFileSync(full, "utf8");
      const parsed = parseMatter(raw);
      parsed.content = stripHiddenSections(parsed.content);
      const fm = parsed.data as Record<string, unknown>;
      const fallbackTitle = titleFromName(e.name);
      const fmTitle = fmGet(fm, "title");
      const title = typeof fmTitle === "string" && fmTitle.trim() ? fmTitle.trim() : fallbackTitle;
      const note: Note = {
        slug: [...slugParts, slugify(e.name.replace(/\.md$/i, ""))].join("/"),
        title,
        folderSlug: folder.slug,
        folderTitle: folder.title,
        body: parsed.content.trim(),
        excerpt: makeExcerpt(parsed.content),
        tags: strList(fm.tags),
        aliases: strList(fm.aliases),
        disciplines: strList(fmGet(fm, "discipline")),
        firstAid: firstAidText(fmGet(fm, "first aid")),
        subPathologies: strList(fmGet(fm, "sub pathologies")),
        compare: strList(fmGet(fm, "compare")),
        reviewed: toIsoDate(fmGet(fm, "reviewed") ?? fmGet(fm, "last reviewed")),
        sources: parseSources(fmGet(fm, "sources")),
        related: strList(fmGet(fm, "related")),
        updatedAt: fs.statSync(full).mtime.toISOString(),
      };
      folder.notes.push(note);
      notes.push(note);
    }
  }
  return folder;
}

export function getLibrary(): Library {
  const notes: Note[] = [];
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });
  const root = readFolder(CONTENT_DIR, [], "Clinote", notes);

  const bySlug = new Map<string, Note>();
  const folders = new Map<string, Folder>();
  const walk = (f: Folder) => {
    folders.set(f.slug, f);
    f.folders.forEach(walk);
  };
  walk(root);
  for (const n of notes) bySlug.set(n.slug, n);
  return { root, notes, bySlug, folders };
}

/** Resolve a title or alias (case/accents-insensitive) to a note, for [[wikilinks]] and `related`. */
export function resolveNote(lib: Library, name: string): Note | undefined {
  const key = slugify(name);
  return (
    lib.notes.find((n) => slugify(n.title) === key) ??
    lib.notes.find((n) => n.aliases.some((a) => slugify(a) === key)) ??
    lib.notes.find((n) => n.slug.split("/").pop() === key)
  );
}

export function noteCountIn(folder: Folder): number {
  return folder.notes.length + folder.folders.reduce((s, f) => s + noteCountIn(f), 0);
}

export type TreeFolder = {
  slug: string;
  title: string;
  count: number;
  folders: TreeFolder[];
  notes: { slug: string; title: string }[];
};

/** Serializable, minimal tree for the sidebar (no note bodies). */
export function toTree(folder: Folder): TreeFolder {
  return {
    slug: folder.slug,
    title: folder.title,
    count: noteCountIn(folder),
    folders: folder.folders.map(toTree),
    notes: folder.notes.map((n) => ({ slug: n.slug, title: n.title })),
  };
}

export function resolveFolder(lib: Library, name: string): Folder | undefined {
  const key = slugify(name);
  for (const f of lib.folders.values()) if (f.slug && slugify(f.title) === key) return f;
  return undefined;
}