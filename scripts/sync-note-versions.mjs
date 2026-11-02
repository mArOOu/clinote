// Records when each note *really* changed, by content hash rather than file timestamps.
// File mtimes change on copy, git checkout and deploy; hashes only change when the note does.
//
//   npm run sync-versions        (also runs automatically before `npm run dev` and `npm run build`)
//
// Commit data/note-versions.json so the dates are the same on every machine and deploy.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashNote } from "../lib/note-source.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "content");
const manifestPath = path.join(root, "data", "note-versions.json");

// On CI/Vercel the working tree is a fresh checkout: never rewrite the manifest there.
if (process.env.VERCEL || process.env.CI) {
  console.log("[versions] CI environment: using the committed data/note-versions.json as-is.");
  process.exit(0);
}

const today = (() => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
})();

function listNotes(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name.startsWith("_")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) listNotes(full, out);
    else if (e.isFile() && /\.md$/i.test(e.name)) out.push(full);
  }
  return out;
}

const previous = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};
const next = {};
const added = [];
const updated = [];

for (const file of listNotes(contentDir).sort()) {
  const rel = path.relative(contentDir, file).split(path.sep).join("/");
  const hash = hashNote(fs.readFileSync(file, "utf8"));
  const prev = previous[rel];
  if (!prev) {
    next[rel] = { hash, addedAt: today };
    added.push(rel);
  } else if (prev.hash !== hash) {
    next[rel] = { ...prev, hash, updatedAt: today };
    updated.push(rel);
  } else {
    next[rel] = prev;
  }
}
const removed = Object.keys(previous).filter((k) => !(k in next));

const json = JSON.stringify(next, null, 2) + "\n";
const existing = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, "utf8") : "";
if (json !== existing) {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, json);
}

console.log(
  `[versions] ${Object.keys(next).length} notes · ${added.length} new · ${updated.length} updated · ${removed.length} removed`,
);
for (const r of updated) console.log(`[versions]   updated: ${r}`);
