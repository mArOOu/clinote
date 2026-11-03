import Link from "next/link";
import { ArrowRight, BookOpen, ListChecks, Smartphone } from "lucide-react";
import { getLibrary, noteCountIn } from "@/lib/library";
import { SpecialtyIcon } from "@/components/specialty-icon";
import { LandingSearch } from "@/components/landing-search";
import { ThemeToggle } from "@/components/theme-toggle";

const SECTIONS: [string, string][] = [
  ["abstract", "Definition"],
  ["note", "Pathophysiology"],
  ["tip", "Clinical pearls"],
  ["attention", "Clinical presentation"],
  ["check", "Diagnostic criteria"],
  ["fail", "Further investigations"],
  ["bug", "Red flags"],
  ["todo", "Differentials"],
  ["summary", "Management"],
  ["warning", "Pitfalls"],
  ["error", "Complications"],
  ["success", "Typical scenario"],
];

export default function Landing() {
  const lib = getLibrary();
  const specialties = lib.root.folders;
  const emergencyCount = lib.notes.filter((n) => n.kind === "emergency").length;
  const chronicCount = lib.notes.filter((n) => n.kind === "chronic").length;

  return (
    <div className="landing">
      <header className="landing-nav">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden />
          Clinote
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/library" className="landing-link">
            Open library <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </header>

      <main id="main">
        <section className="hero">
          <p className="eyebrow">Clinical reference · for study</p>
          <h1>
            Clinical knowledge,
            <br />
            quick to find and calm to read.
          </h1>
          <p className="hero-sub">
            A personal library of structured clinical notes. Every note follows the same layout, so red flags,
            management and pitfalls are always where you expect them.
          </p>
          <LandingSearch />
          <div className="hero-actions">
            <Link href="/library" className="btn btn-primary">
              Browse the library <ArrowRight size={16} aria-hidden />
            </Link>
            <span className="hero-stats">
              {lib.notes.length} {lib.notes.length === 1 ? "note" : "notes"} · {specialties.length}{" "}
              {specialties.length === 1 ? "specialty" : "specialties"}
              {emergencyCount + chronicCount > 0 && (
                <>
                  {" "}· {emergencyCount} {emergencyCount === 1 ? "emergency" : "emergencies"} · {chronicCount} primary care / chronic
                </>
              )}
            </span>
          </div>
        </section>

        {specialties.length > 0 && (
          <section className="landing-section" aria-labelledby="spec-h">
            <h2 id="spec-h" className="section-label">
              Specialties
            </h2>
            <ul className="folder-grid">
              {specialties.map((f) => (
                <li key={f.slug}>
                  <Link href={`/f/${f.slug}`} className="folder-tile">
                    <SpecialtyIcon name={f.title} size={18} className="tile-icon" />
                    <span className="flex-1">{f.title}</span>
                    <span className="tree-count">{noteCountIn(f)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="landing-section features">
          <div>
            <ListChecks size={20} aria-hidden />
            <h3>Same structure, every note</h3>
            <p>Colour-coded sections you can collapse, so the part you need is one tap away.</p>
          </div>
          <div>
            <BookOpen size={20} aria-hidden />
            <h3>Fast to search</h3>
            <p>Press Ctrl K to search titles, aliases, tags and full text, and filter with #tags.</p>
          </div>
          <div>
            <Smartphone size={20} aria-hidden />
            <h3>Made for phone reading</h3>
            <p>A compact layout with large tap targets and light and dark themes.</p>
          </div>
        </section>

        <section className="landing-section" aria-labelledby="layout-h">
          <h2 id="layout-h" className="section-label">
            Every note, same layout
          </h2>
          <ul className="legend">
            {SECTIONS.map(([kind, label]) => (
              <li key={kind} className={`callout callout-${kind} legend-item`}>
                {label}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="landing-foot">
        <p className="landing-author">
          &copy; 2026 <strong>Marouane Mebarek Falouti</strong> · Clinote
        </p>
        <p className="disclaimer">
          Clinote contains personal study notes. They are not independently validated and are not a clinical
          decision-support tool. Always verify against current guidelines. Never store patient-identifiable
          information.
        </p>
      </footer>
    </div>
  );
}
