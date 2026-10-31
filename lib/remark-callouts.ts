import GithubSlugger from "github-slugger";

type MdNode = {
  type: string;
  value?: string;
  children?: MdNode[];
  data?: Record<string, unknown>;
};

/** Canonical callout kinds (Obsidian aliases map onto these). Each gets its own colour in CSS. */
const ALIASES: Record<string, string> = {
  summary: "summary",
  tldr: "summary",
  abstract: "abstract",
  note: "note",
  seealso: "note",
  info: "info",
  tip: "tip",
  hint: "tip",
  important: "tip",
  attention: "attention",
  warning: "warning",
  caution: "warning",
  check: "check",
  done: "check",
  success: "success",
  fail: "fail",
  failure: "fail",
  missing: "fail",
  bug: "bug",
  danger: "bug",
  error: "error",
  todo: "todo",
  question: "todo",
  help: "todo",
  faq: "todo",
  example: "example",
  quote: "example",
  cite: "example",
};

function transform(bq: MdNode, slugger: GithubSlugger) {
  const p = bq.children?.[0];
  if (!p || p.type !== "paragraph" || !p.children?.length) return;
  const first = p.children[0];
  if (first.type !== "text" || !first.value) return;
  const m = /^\[!([\w-]+)\]([+-]?)[ \t]*([^\n]*)\n?/.exec(first.value);
  if (!m) return;

  const raw = m[1].toLowerCase();
  const kind = ALIASES[raw] ?? "note";
  const fold = m[2]; // "-" collapsed, "+" expanded, "" not foldable
  const title = m[3].trim() || raw.charAt(0).toUpperCase() + raw.slice(1);

  first.value = first.value.slice(m[0].length);
  if (!first.value) p.children.shift();
  if (p.children.length === 0) bq.children!.shift();

  const classes = ["callout", `callout-${kind}`];
  if (fold) {
    bq.data = {
      hName: "details",
      hProperties: { className: classes, id: slugger.slug(title), ...(fold === "+" ? { open: true } : {}) },
    };
  } else {
    bq.data = { hName: "div", hProperties: { className: classes, id: slugger.slug(title) } };
  }
  bq.children!.unshift({
    type: "paragraph",
    data: { hName: fold ? "summary" : "div", hProperties: { className: ["callout-title"] } },
    children: [{ type: "text", value: title }],
  });
}

/** Parse Obsidian-style `> [!type]± Title` blockquotes into (collapsible) callouts. */
export function remarkCallouts() {
  const slugger = new GithubSlugger();
  const walk = (node: MdNode) => {
    if (node.type === "blockquote") transform(node, slugger);
    node.children?.forEach(walk);
  };
  return (tree: MdNode) => walk(tree);
}

/** Section outline for the TOC: ids match those produced by the plugin above and by rehype-slug. */
export function extractOutline(body: string) {
  const calloutSlugger = new GithubSlugger();
  const headingSlugger = new GithubSlugger();
  const out: { id: string; text: string; kind: string }[] = [];
  let inCode = false;
  for (const line of body.split("\n")) {
    if (/^```/.test(line)) inCode = !inCode;
    if (inCode) continue;
    const c = /^>\s*\[!([\w-]+)\][+-]?[ \t]*(.*)$/.exec(line);
    if (c) {
      const raw = c[1].toLowerCase();
      const text = c[2].trim() || raw.charAt(0).toUpperCase() + raw.slice(1);
      out.push({ id: calloutSlugger.slug(text), text, kind: ALIASES[raw] ?? "note" });
      continue;
    }
    const h = /^##\s+(.+?)\s*#*$/.exec(line);
    if (h) {
      const text = h[1].replace(/[*_`]/g, "");
      out.push({ id: headingSlugger.slug(text), text, kind: "heading" });
    }
  }
  return out;
}
