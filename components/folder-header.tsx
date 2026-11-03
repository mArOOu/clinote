"use client";

import Link from "next/link";
import { SpecialtyIcon } from "@/components/specialty-icon";
import { useTranslation } from "@/lib/i18n";

type CrumbItem = { slug: string; title: string };

export function FolderHeader({
  folderTitle,
  noteCount,
  crumbs,
}: {
  folderTitle: string;
  noteCount: number;
  crumbs: CrumbItem[];
}) {
  const { t, tSpecialty } = useTranslation();

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/library">{t("library")}</Link>
        {crumbs.map((c) => (
          <span key={c.slug}>
            <span aria-hidden> / </span>
            <Link href={`/f/${c.slug}`}>{tSpecialty(c.title)}</Link>
          </span>
        ))}
      </nav>
      <h1 className="page-title page-title-icon">
        <SpecialtyIcon name={folderTitle} size={28} className="title-icon" />
        {tSpecialty(folderTitle)}
      </h1>
      <p className="page-sub">
        {noteCount} {noteCount === 1 ? (t("library") === "Bibliothèque" ? "fiche" : "note") : (t("library") === "Bibliothèque" ? "fiches" : "notes")}
      </p>
    </>
  );
}
