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
  [/cardio|heart/, HeartPulse],
  [/pneumo|pulmo|respir|lung/, Wind],
  [/gastro|digest|hepat|liver/, Utensils],
  [/neurosurg/, Scissors],
  [/neuro|brain|psych/, Brain],
  [/infect|microb|bacter|virol/, Bug],
  [/hemat|blood/, Droplet],
  [/emerg|urgen|critical|resusc|icu/, Siren],
  [/surg/, Scissors],
  [/ortho|rheum|bone|trauma/, Bone],
  [/pediat|paed|neonat/, Baby],
  [/ophthal|eye/, Eye],
  [/\bent\b|otolar|ear/, Ear],
  [/pharma|drug|medic/, Pill],
  [/onco|cancer/, Microscope],
  [/endocr|diabet/, Syringe],
  [/nephro|renal|kidney|uro/, Activity],
  [/personal|my notes/, StickyNote],
  [/hospital|general/, Hospital],
];

function pick(name: string): LucideIcon {
  const n = name.toLowerCase();
  return RULES.find(([re]) => re.test(n))?.[1] ?? Folder;
}

/** Icon chosen from the folder name. Rendered via createElement to keep the lookup out of JSX. */
export function SpecialtyIcon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  return createElement(pick(name), { size, strokeWidth: 1.75, "aria-hidden": true, className });
}