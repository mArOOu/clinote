// Shared by lib/library.ts (the app) and scripts/sync-note-versions.mjs (version tracking).
// Plain ESM so both TypeScript and Node can import it without a build step.
import { createHash } from "node:crypto";
import matter from "gray-matter";

/** Callout titles that are never shown or counted (kept in the source files, dropped at load time). */
export const HIDDEN_SECTIONS = ["personal experience"];

export function stripHiddenSections(body) {
  const out = [];
  let skipping = false;
  for (const line of body.split(/\r?\n/)) {
    const m = /^>\s*\[![\w-]+\][+-]?[ \t]*(.*)$/.exec(line);
    if (m) skipping = HIDDEN_SECTIONS.includes(m[1].trim().toLowerCase());
    else if (skipping && !/^>/.test(line)) skipping = false;
    if (!skipping) out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

/**
 * Obsidian allows `Compare: [[A]], [[B]]`, which is not valid YAML (a flow sequence followed by more text).
 * Quote any frontmatter scalar that starts with `[[` so the rest of the note still parses.
 */
function repairFrontmatter(raw) {
  const m = /^(---\r?\n)([\s\S]*?)(\r?\n---)/.exec(raw);
  if (!m) return raw;
  const fixed = m[2]
    .split(/\r?\n/)
    .map((line) => {
      const kv = /^([^\s:#-][^:]*):[ \t]+(\[\[.*)$/.exec(line);
      if (!kv) return line;
      return `${kv[1]}: '${kv[2].replace(/'/g, "''")}'`;
    })
    .join("\n");
  return m[1] + fixed + m[3] + raw.slice(m[0].length);
}

/**
 * Parse a note file. Never throws: a note with broken frontmatter still loads (without metadata)
 * and reports a warning, so one bad file cannot take the whole site down.
 * @returns {{ data: Record<string, unknown>, content: string, warning?: string }}
 */
export function readNoteSource(raw) {
  try {
    const parsed = matter(repairFrontmatter(raw));
    return { data: parsed.data ?? {}, content: stripHiddenSections(parsed.content) };
  } catch (err) {
    const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
    return {
      data: {},
      content: stripHiddenSections(body),
      warning: `Invalid frontmatter (${String(err instanceof Error ? err.message : err).split("\n")[0]})`,
    };
  }
}

function sortKeys(v) {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object" && !(v instanceof Date)) {
    return Object.fromEntries(
      Object.keys(v)
        .sort()
        .map((k) => [k, sortKeys(v[k])]),
    );
  }
  return v instanceof Date ? v.toISOString() : v;
}

/**
 * Fingerprint of what a reader sees: metadata + visible body. Line endings, trailing whitespace,
 * file timestamps and hidden sections do not change it, so only real edits do.
 */
export function hashNote(raw) {
  const { data, content } = readNoteSource(raw);
  const body = content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/, ""))
    .join("\n")
    .trim();
  return createHash("sha1")
    .update(JSON.stringify(sortKeys(data)))
    .update("\n\u0000\n")
    .update(body)
    .digest("hex");
}
