import { createElement } from "react";
import {
  Activity,
  Baby,
  Bone,
  Brain,
  Bug,
  Droplet,
  Ear,
  Eye,
  Folder,
  HeartPulse,
  Hospital,
  Microscope,
  Pill,
  Scissors,
  Siren,
  StickyNote,
  Syringe,
  Utensils,
  Wind,
  type LucideIcon,
} from "lucide-react";

/** First matching keyword wins. Names are matched case-insensitively against folder titles. */
const RULES: [RegExp, LucideIcon][] = [
  [/cardio|heart|coeur/, HeartPulse],
  [/pneumo|pulmo|respir|lung|poumon/, Wind],
  [/gastro|digest|hepat|liver|foie/, Utensils],
  [/neurosurg|neurochir/, Scissors],
  [/neuro|brain|psych|cerveau/, Brain],
  [/infect|microb|bacter|virol/, Bug],
  [/hemat|blood|sang/, Droplet],
  [/emerg|urgen|critical|resusc|icu|reanim/, Siren],
  [/surg|chirurg/, Scissors],
  [/ortho|rheum|bone|trauma|os\b/, Bone],
  [/pediat|paed|neonat|enfant/, Baby],
  [/ophthal|ophtal|eye|oeil|yeux/, Eye],
  [/\bent\b|\borl\b|otolar|ear|oreille/, Ear],
  [/pharma|drug|medic/, Pill],
  [/onco|cancer/, Microscope],
  [/endocr|diabet/, Syringe],
  [/nephro|renal|kidney|uro|rein/, Activity],
  [/personal|my notes|notes perso/, StickyNote],
  [/hospital|general/, Hospital],
];

function pick(name: string): LucideIcon {
  // Strip accents and lower-case so "Pédiatrie" matches "pediat", "Hématologie" matches "hemat"
  const n = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return RULES.find(([re]) => re.test(n))?.[1] ?? Folder;
}

/** Icon chosen from the folder name. Rendered via createElement to keep the lookup out of JSX. */
export function SpecialtyIcon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  return createElement(pick(name), { size, strokeWidth: 1.75, "aria-hidden": true, className });
}