/** Note type: acute/time-critical presentations vs. primary-care and chronic conditions. */
export type Kind = "emergency" | "chronic" | "unclassified";

export const KIND_ORDER: Kind[] = ["emergency", "chronic", "unclassified"];

export const KINDS: Record<
  Kind,
  { label: string; short: string; plural: string; description: string; href: string }
> = {
  emergency: {
    label: "Emergency",
    short: "Emergency",
    plural: "Emergencies",
    description: "Acute, time-critical presentations: recognise, stabilise, act.",
    href: "/library/emergency",
  },
  chronic: {
    label: "Primary care / Chronic",
    short: "Chronic",
    plural: "Primary care & chronic",
    description: "Outpatient, long-term and routine conditions.",
    href: "/library/chronic",
  },
  unclassified: {
    label: "Not classified",
    short: "Unclassified",
    plural: "Not classified yet",
    description: "Notes with no type yet. Add `Type: Emergency` or `Type: Chronic` to the frontmatter.",
    href: "/library/unclassified",
  },
};

const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Matched exactly against normalised tags (Emergency_Medicine, emergency-medicine, EmergencyMedicine → same key).
const EMERGENCY_TAGS = new Set([
  "emergency",
  "emergencies",
  "emergencymedicine",
  "criticalcare",
  "intensivecare",
  "icu",
  "acls",
  "resuscitation",
  "acs",
  "shock",
  "toxicology",
]);
const CHRONIC_TAGS = new Set([
  "chronic",
  "chronicdisease",
  "outpatient",
  "primarycare",
  "ambulatory",
  "generalpractice",
  "familymedicine",
]);

function fromExplicit(value: string): Kind | undefined {
  const v = key(value);
  if (/emerg|acute|urgent|critical/.test(v)) return "emergency";
  if (/chronic|primary|outpatient|ambulatory|routine|general/.test(v)) return "chronic";
  return undefined;
}

/**
 * Explicit `Type:` (or `Category:` / `Setting:`) wins. Otherwise infer from tags and discipline using
 * only unambiguous signals. Anything else stays "unclassified" rather than being guessed, because
 * labelling an emergency as routine is the worst possible mistake in a clinical reference.
 */
export function classify(explicit: string | undefined, tags: string[], disciplines: string[]): Kind {
  if (explicit) {
    const k = fromExplicit(explicit);
    if (k) return k;
  }
  const tagKeys = tags.map(key);
  const emergency = tagKeys.some((t) => EMERGENCY_TAGS.has(t)) || disciplines.some((d) => /emergency/i.test(d));
  if (emergency) return "emergency"; // if signals conflict, treat as the more urgent kind
  const chronic = tagKeys.some((t) => CHRONIC_TAGS.has(t)) || disciplines.some((d) => /primary care|family/i.test(d));
  return chronic ? "chronic" : "unclassified";
}
