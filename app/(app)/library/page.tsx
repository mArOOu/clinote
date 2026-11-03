import { getLibrary } from "@/lib/library";
import { LibraryView } from "@/components/library-view";

export default function LibraryHome() {
  const lib = getLibrary();
  return <LibraryView lib={lib} />;
}
