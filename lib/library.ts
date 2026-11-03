import "server-only";
import fs from "node:fs";
import path from "node:path";
import { classify, type Kind } from "./kinds";
import { hashNote, readNoteSource } from "./note-source.mjs";

/**
 * Filesystem-backed library. Folders under /content are specialties/collections,
 * *.md files are notes. This is the single data-access seam: when Supabase is
 * added, replace the internals of getLibrary() and keep the exported types.
 */

export const CONTENT_DIR = path.join(process.cwd(), "content");

export type Source = { title: string; url?: string; kind: "own" | "reference" };

export type NoteFr = {
  title: string;
  body: string;
  excerpt: string;
  sources?: Source[];
  updatedAt?: string;
};

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
  kind: Kind; // emergency vs primary care / chronic (see lib/kinds.ts)
  /** yyyy-mm-dd of the last *real* content change (by content hash). Undefined until the note is edited. */
  updatedAt?: string;
  /** Set when the frontmatter could not be parsed; the note still loads without metadata. */
  warning?: string;
  /** Optional French translation loaded from a companion `.fr.md` file. */
  fr?: NoteFr;
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

/** `splitSlash` also splits "Pulmonology / Internal Medicine" into separate disciplines. */
function strList(v: unknown, splitSlash = false): string[] {
  const items = Array.isArray(v) ? v.flat(Infinity).map(String) : typeof v === "string" ? v.split(",") : [];
  return items
    .flatMap((x) => (splitSlash ? x.split(/\s+\/\s+/) : [x]))
    .map((x) => stripWiki(x.trim()))
    .filter(Boolean);
}

type VersionEntry = { hash: string; addedAt?: string; updatedAt?: string };

function loadVersions(): Record<string, VersionEntry> {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "note-versions.json"), "utf8"));
  } catch {
    return {};
  }
}

/**
 * "Updated" means the content really changed, never that a file was touched or copied.
 * The committed manifest (data/note-versions.json, maintained by scripts/sync-note-versions.mjs) stores
 * a content hash and the date it last changed. While developing, an edit that has not been synced yet
 * is shown using the file time so you get feedback immediately; in production only the manifest counts.
 */
function resolveUpdatedAt(rel: string, raw: string, fullPath: string): string | undefined {
  const entry = versions[rel];
  if (!entry) return undefined; // not tracked yet: new notes are not "updated"
  if (process.env.NODE_ENV !== "production" && entry.hash !== hashNote(raw)) {
    return localDate(fs.statSync(fullPath).mtime);
  }
  return entry.updatedAt;
}

function localDate(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

let versions: Record<string, VersionEntry> = {};

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
    } else if (e.isFile() && /\.md$/i.test(e.name) && !/\.fr\.md$/i.test(e.name)) {
      const raw = fs.readFileSync(full, "utf8");
      const parsed = readNoteSource(raw);
      const fm = parsed.data as Record<string, unknown>;
      const fallbackTitle = titleFromName(e.name);
      const fmTitle = fmGet(fm, "title");
      const title = typeof fmTitle === "string" && fmTitle.trim() ? fmTitle.trim() : fallbackTitle;
      const tags = strList(fmGet(fm, "tags"));
      const disciplines = strList(fmGet(fm, "discipline"), true);
      const explicitKind = ["type", "category", "setting"]
        .map((k) => fmGet(fm, k))
        .find((v): v is string => typeof v === "string" && v.trim() !== "");
      const rel = path.relative(CONTENT_DIR, full).split(path.sep).join("/");

      // Optional French companion note: same name ending in .fr.md
      const frFile = path.join(dir, e.name.replace(/\.md$/i, ".fr.md"));
      let fr: NoteFr | undefined = undefined;
      if (fs.existsSync(frFile)) {
        const frRaw = fs.readFileSync(frFile, "utf8");
        const frParsed = readNoteSource(frRaw);
        const frFm = frParsed.data as Record<string, unknown>;
        const frFmTitle = fmGet(frFm, "title");
        const frTitle = typeof frFmTitle === "string" && frFmTitle.trim() ? frFmTitle.trim() : title;
        const frRel = path.relative(CONTENT_DIR, frFile).split(path.sep).join("/");
        fr = {
          title: frTitle,
          body: frParsed.content.trim(),
          excerpt: makeExcerpt(frParsed.content),
          sources: parseSources(fmGet(frFm, "sources")),
          updatedAt: resolveUpdatedAt(frRel, frRaw, frFile),
        };
      }

      const note: Note = {
        slug: [...slugParts, slugify(e.name.replace(/\.md$/i, ""))].join("/"),
        title,
        folderSlug: folder.slug,
        folderTitle: folder.title,
        body: parsed.content.trim(),
        excerpt: makeExcerpt(parsed.content),
        tags,
        aliases: strList(fmGet(fm, "aliases")),
        disciplines,
        firstAid: firstAidText(fmGet(fm, "first aid")),
        subPathologies: strList(fmGet(fm, "sub pathologies")),
        compare: strList(fmGet(fm, "compare")),
        reviewed: toIsoDate(fmGet(fm, "reviewed") ?? fmGet(fm, "last reviewed")),
        sources: parseSources(fmGet(fm, "sources")),
        related: strList(fmGet(fm, "related")),
        kind: classify(explicitKind, tags, disciplines),
        updatedAt: resolveUpdatedAt(rel, raw, full),
        warning: parsed.warning,
        fr,
      };
      folder.notes.push(note);
      notes.push(note);
    }
  }
  return folder;
}

export function getLibrary(): Library {
  const notes: Note[] = [];
  versions = loadVersions();
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
  notes: { slug: string; title: string; frTitle?: string; kind: Kind; hasFr?: boolean }[];
};

/** Serializable, minimal tree for the sidebar (no note bodies). */
export function toTree(folder: Folder): TreeFolder {
  return {
    slug: folder.slug,
    title: folder.title,
    count: noteCountIn(folder),
    folders: folder.folders.map(toTree),
    notes: folder.notes.map((n) => ({
      slug: n.slug,
      title: n.title,
      frTitle: n.fr?.title,
      kind: n.kind,
      hasFr: !!n.fr,
    })),
  };
}

export function resolveFolder(lib: Library, name: string): Folder | undefined {
  const key = slugify(name);
  for (const f of lib.folders.values()) if (f.slug && slugify(f.title) === key) return f;
  return undefined;
}