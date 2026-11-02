import type { Metadata } from "next";
import { KindPage } from "@/components/kind-page";
import { KINDS } from "@/lib/kinds";

export const metadata: Metadata = { title: KINDS.chronic.plural };

export default function Page() {
  return <KindPage kind="chronic" />;
}