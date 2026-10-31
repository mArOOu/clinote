import { AppShell } from "@/components/app-shell";
import { getLibrary, toTree } from "@/lib/library";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const tree = toTree(getLibrary().root);
  return <AppShell tree={tree}>{children}</AppShell>;
}
