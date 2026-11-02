import { CircleHelp, Siren, Stethoscope } from "lucide-react";
import { KINDS, type Kind } from "@/lib/kinds";

/** Icon + label for a note type. `full` uses the long label ("Primary care / Chronic"). */
export function KindBadge({ kind, full = false, className = "" }: { kind: Kind; full?: boolean; className?: string }) {
  const text = full ? KINDS[kind].label : KINDS[kind].short;
  return (
    <span className={`kind-badge kind-${kind} ${className}`}>
      {kind === "emergency" && <Siren size={12} aria-hidden />}
      {kind === "chronic" && <Stethoscope size={12} aria-hidden />}
      {kind === "unclassified" && <CircleHelp size={12} aria-hidden />}
      {text}
    </span>
  );
}

/** Small coloured marker used in the sidebar tree. */
export function KindDot({ kind }: { kind: Kind }) {
  return (
    <span
      className={`kind-dot kind-dot-${kind}`}
      role={kind === "unclassified" ? undefined : "img"}
      aria-label={kind === "unclassified" ? undefined : KINDS[kind].label}
      title={kind === "unclassified" ? undefined : KINDS[kind].label}
    />
  );
}
