import Link from "next/link";
import { getLibrary } from "@/lib/library";
import { KIND_ORDER, KINDS, type Kind } from "@/lib/kinds";

/** Segmented links between the type views (counts included). */
export function KindTabs({ active }: { active: Kind }) {
  const { notes } = getLibrary();
  const count = (k: Kind) => notes.filter((n) => n.kind === k).length;
  return (
    <nav className="kind-tabs" aria-label="Browse by type">
      <Link href="/library" className="kind-tab">
        All
        <span className="tree-count">{notes.length}</span>
      </Link>
      {KIND_ORDER.filter((k) => k !== "unclassified" || count(k) > 0 || active === k).map((k) => (
        <Link
          key={k}
          href={KINDS[k].href}
          className={`kind-tab kind-tab-${k}`}
          aria-current={k === active ? "page" : undefined}
          data-active={k === active}
        >
          {KINDS[k].plural}
          <span className="tree-count">{count(k)}</span>
        </Link>
      ))}
    </nav>
  );
}
