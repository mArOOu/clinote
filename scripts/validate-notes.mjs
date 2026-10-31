import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = path.resolve(process.cwd());
const contentDir = path.join(root, "content");
const notes = [];
const errors = [];
const warnings = [];
const folders = new Set();

function slugify(input) {
  return (
    input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled"
  );
}

function keyFor(value) {
  return slugify(value).replace(/\\/g, "/");
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      folders.add(slugify(entry.name));
      walk(fullPath);
    }
    else if (entry.isFile() && /\.md$/i.test(entry.name)) notes.push(fullPath);
  }
}

walk(contentDir);

const byName = new Map();
for (const file of notes) {
  const relative = path.relative(contentDir, file);
  let parsed;
  try {
    parsed = matter(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${relative}: invalid frontmatter (${error.message})`);
    continue;
  }

  const data = parsed.data;
  const title = typeof data.title === "string" && data.title.trim()
    ? data.title.trim()
    : path.basename(file, path.extname(file)).replace(/[-_]+/g, " ").trim();
  const relativeSlug = relative.replace(/\.md$/i, "").split(path.sep).map(slugify).join("/");
  const names = [title, path.basename(file, path.extname(file)), relativeSlug];
  for (const alias of Array.isArray(data.aliases) ? data.aliases : []) names.push(String(alias));

  for (const name of names) {
    const key = keyFor(name);
    if (byName.has(key) && byName.get(key) !== file) {
      warnings.push(`${relative}: duplicate note name or slug "${name}"`);
    } else {
      byName.set(key, file);
    }
  }

  const reviewed = data.reviewed ?? data["last reviewed"];
  if (!reviewed) {
    warnings.push(`${relative}: missing reviewed date`);
  } else {
    const reviewedText = reviewed instanceof Date ? reviewed.toISOString().slice(0, 10) : String(reviewed);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedText)) {
      errors.push(`${relative}: reviewed must use YYYY-MM-DD`);
    }
  }

  if (!data.sources) warnings.push(`${relative}: missing sources`);
  else if (!Array.isArray(data.sources)) errors.push(`${relative}: sources must be a YAML list`);
}

const wikilinkPattern = /\[\[([^\]|\n]+)(?:\|[^\]\n]+)?\]\]/g;
for (const file of notes) {
  const relative = path.relative(root, file);
  const body = fs.readFileSync(file, "utf8");
  for (const match of body.matchAll(wikilinkPattern)) {
    const target = match[1].trim().split("#")[0];
    if (target && !byName.has(keyFor(target)) && !folders.has(slugify(target))) {
      warnings.push(`${relative}: wikilink has no matching note or folder "${target}"`);
    }
  }
}

for (const message of warnings) console.warn(`WARN ${message}`);
for (const message of errors) console.error(`ERROR ${message}`);
console.log(`Checked ${notes.length} notes: ${errors.length} error(s), ${warnings.length} warning(s).`);
if (errors.length) process.exitCode = 1;
