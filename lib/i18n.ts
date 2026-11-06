"use client";

import { useSyncExternalStore } from "react";

export type Lang = "en" | "fr";

function getLangSnapshot(): Lang {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem("clinote-lang") === "fr" ? "fr" : "en";
}

function getServerLangSnapshot(): Lang {
  return "en";
}

function subscribeLang(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function setAppLang(next: Lang) {
  if (typeof window !== "undefined") {
    localStorage.setItem("clinote-lang", next);
    window.dispatchEvent(new Event("storage"));
  }
}

export function useLang(): {
  lang: Lang;
  isFr: boolean;
  setLang: (next: Lang) => void;
  toggleLang: () => void;
} {
  const lang = useSyncExternalStore(subscribeLang, getLangSnapshot, getServerLangSnapshot);
  const isFr = lang === "fr";
  const setLang = (next: Lang) => setAppLang(next);
  const toggleLang = () => setAppLang(lang === "fr" ? "en" : "fr");

  return { lang, isFr, setLang, toggleLang };
}

export const SPECIALTY_FR: Record<string, string> = {
  Cardiology: "Cardiologie",
  Gastrology: "Gastro-entérologie",
  Pneumology: "Pneumologie",
  Surgery: "Chirurgie",
  Pediatrics: "Pédiatrie",
  Neurology: "Neurologie",
  Neurosurgery: "Neurochirurgie",
  Endocrinology: "Endocrinologie",
  Nephrology: "Néphrologie",
  Infectious: "Maladies Infectieuses",
  Dermatology: "Dermatologie",
  Hematology: "Hématologie",
  Psychiatry: "Psychiatrie",
  Gynecology: "Gynécologie-Obstétrique",
  Rheumatology: "Rhumatologie",
  Ophthalmology: "Ophtalmologie",
  ENT: "ORL",
};

export const UI_STRINGS = {
  // Navigation & Shell
  library: { en: "Library", fr: "Bibliothèque" },
  about: { en: "About Clinote", fr: "À propos de Clinote" },
  search: { en: "Search", fr: "Rechercher" },
  searchNotes: { en: "Search notes", fr: "Rechercher une fiche" },
  searchPrompt: {
    en: "Search clinical notes, pathologies, drugs...",
    fr: "Rechercher une fiche clinique, pathologie, traitement...",
  },
  searchPlaceholder: {
    en: "Search notes, tags (#acute), content...",
    fr: "Rechercher une fiche, mot-clé (#urgence), contenu...",
  },
  openMenu: { en: "Open menu", fr: "Ouvrir le menu" },
  closeMenu: { en: "Close menu", fr: "Fermer le menu" },
  collapse: { en: "Collapse", fr: "Replier" },
  expand: { en: "Expand", fr: "Déplier" },
  disclaimer: {
    en: "Personal study notes · not validated clinical guidance.",
    fr: "Fiches d'étude personnelles · non validées comme recommandations officielles.",
  },
  copyright: {
    en: "© Marouane Mebarek Falouti",
    fr: "© Marouane Mebarek Falouti",
  },

  // Library Page
  librarySub: {
    en: (count: number) =>
      `${count} ${count === 1 ? "note" : "notes"} · press Ctrl K or / to search`,
    fr: (count: number) =>
      `${count} ${count === 1 ? "fiche" : "fiches"} · appuyez sur Ctrl K ou / pour rechercher`,
  },
  emptyLibrary: {
    en: "The library is empty. Add Markdown files to the content/ folder; folders become specialties.",
    fr: "La bibliothèque est vide. Ajoutez des fichiers Markdown dans le dossier content/ ; les dossiers deviennent des spécialités.",
  },
  browseByType: { en: "Browse by type", fr: "Par type de prise en charge" },
  specialties: { en: "Specialties", fr: "Spécialités" },
  recentlyUpdated: { en: "Recently updated", fr: "Récemment mises à jour" },
  emergenciesTitle: { en: "Emergencies", fr: "Urgences & Réanimation" },
  emergenciesDesc: {
    en: "Resuscitation, acute deterioration & time-critical protocols",
    fr: "Détresse vitale, réanimation & protocoles à prise en charge immédiate",
  },
  chronicTitle: { en: "Primary Care & Chronic", fr: "Soins Primaires & Chronique" },
  chronicDesc: {
    en: "Outpatient care, routine follow-up & chronic disease management",
    fr: "Consultation, suivi ambulatoire & prise en charge des pathologies chroniques",
  },
  unclassifiedHint: {
    en: (count: number) => `${count} ${count === 1 ? "note is" : "notes are"} not classified yet`,
    fr: (count: number) => `${count} ${count === 1 ? "fiche n'est" : "fiches ne sont"} pas encore classées`,
  },

  // Search Dialog
  filterAll: { en: "All", fr: "Toutes" },
  filterEmergencies: { en: "Emergencies", fr: "Urgences" },
  filterChronic: { en: "Primary Care", fr: "Soins primaires" },
  noResults: { en: "No notes matching", fr: "Aucune fiche correspondante pour" },
  tryBroader: {
    en: "Try searching with broader terms or different tags.",
    fr: "Essayez avec des termes plus larges ou un autre mot-clé.",
  },
  availableInFr: { en: "FR available", fr: "Disponible en FR" },
  searchTipNav: { en: "navigate", fr: "naviguer" },
  searchTipOpen: { en: "open", fr: "ouvrir" },
  searchTipClose: { en: "esc to close", fr: "échap pour fermer" },
  indexOfflineNote: {
    en: "Search is fully indexed and works offline.",
    fr: "La recherche est indexée localement et fonctionne 100% hors-ligne.",
  },

  // Note View
  onThisPage: { en: "On this page", fr: "Sommaire" },
  jumpToSection: { en: "Jump to section", fr: "Aller à la section" },
  expandAll: { en: "Expand all", fr: "Tout déplier" },
  collapseAll: { en: "Collapse all", fr: "Tout replier" },
  sourcesTitle: { en: "Sources & Guidelines", fr: "Sources & Références Médicales" },
  includes: { en: "Includes", fr: "Comprend" },
  compareWith: { en: "Compare with", fr: "Comparer avec" },
  relatedNotes: { en: "Related notes", fr: "Fiches associées" },
  updatedPrefix: { en: "Updated", fr: "Mise à jour le" },
  onlyEnNotice: {
    en: "This note is currently available only in English.",
    fr: "Cette fiche est actuellement disponible uniquement en anglais.",
  },
  backToLibrary: { en: "Back to Library", fr: "Retour à la bibliothèque" },
} as const;

export function useTranslation() {
  const { lang, isFr, setLang, toggleLang } = useLang();

  const t = <K extends keyof typeof UI_STRINGS>(key: K): (typeof UI_STRINGS)[K]["en"] | (typeof UI_STRINGS)[K]["fr"] => {
    return UI_STRINGS[key][lang];
  };

  const tSpecialty = (name: string): string => {
    if (!isFr) return name;
    return SPECIALTY_FR[name] || name;
  };

  return { lang, isFr, setLang, toggleLang, t, tSpecialty };
}
