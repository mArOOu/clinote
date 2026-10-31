import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import "katex/dist/katex.min.css";
import { remarkCallouts } from "@/lib/remark-callouts";
import { resolveFolder, resolveNote, type Library } from "@/lib/library";

/** Convert [[Title]] / [[Title|label]] into links to notes or folders (outside fenced code). */
function resolveWikilinks(body: string, lib: Library) {
  return body
    .split(/(```[\s\S]*?```)/g)
    .map((part, i) => {
      if (i % 2 === 1) return part;
      return part.replace(/\[\[([^\]|\n]+)(?:\|([^\]\n]+))?\]\]/g, (_, target: string, label?: string) => {
        const text = (label ?? target).trim();
        const name = target.trim().split("#")[0];
        const note = resolveNote(lib, name);
        if (note) return `[${text}](/n/${note.slug})`;
        const folder = resolveFolder(lib, name);
        if (folder) return `[${text}](/f/${folder.slug})`;
        return `[${text}](#missing-note)`;
      });
    })
    .join("");
}

export function Markdown({ body, lib }: { body: string; lib: Library }) {
  return (
    <div className="note-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkCallouts]}
        rehypePlugins={[rehypeSlug, [rehypeKatex, { strict: false }]]}
        components={{
          a({ href, children }) {
            if (!href) return <>{children}</>;
            if (href === "#missing-note")
              return (
                <span className="missing-link" title="No matching note in the library">
                  {children}
                </span>
              );
            if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
            if (href.startsWith("#")) return <a href={href}>{children}</a>;
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="table-wrap">
                <table>{children}</table>
              </div>
            );
          },
          img() {
            return null; // images are not supported yet; avoids broken local Obsidian paths
          },
        }}
      >
        {resolveWikilinks(body, lib)}
      </ReactMarkdown>
    </div>
  );
}
