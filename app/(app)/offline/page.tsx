"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="page">
      <div className="offline-card">
        <div className="offline-icon-wrap">
          <WifiOff size={28} aria-hidden />
        </div>
        <h1 className="page-title" style={{ fontSize: "1.8rem", marginTop: "1rem" }}>
          You’re working offline
        </h1>
        <p className="offline-desc">
          This note hasn’t been cached on this device yet. Any clinical notes or specialty collections you
          have previously opened are saved in your offline cache and remain fully readable.
        </p>

        <div className="offline-tips">
          <h2 className="section-label" style={{ marginTop: 0 }}>
            Offline capabilities
          </h2>
          <ul>
            <li>
              <strong>Instant search:</strong> Press <kbd>Ctrl K</kbd> to search all note titles, aliases, and #tags
              using your locally cached index.
            </li>
            <li>
              <strong>Cached notes:</strong> All notes you opened while connected are accessible offline.
            </li>
            <li>
              <strong>Automatic caching:</strong> When connectivity returns, opening any note caches it
              automatically for subsequent offline use.
            </li>
          </ul>
        </div>

        <div className="hero-actions" style={{ justifyContent: "center", marginTop: "1.5rem" }}>
          <Link href="/library" className="btn btn-primary">
            <ArrowLeft size={16} aria-hidden /> Browse cached library
          </Link>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") window.location.reload();
            }}
            className="btn btn-secondary"
          >
            <RefreshCw size={15} aria-hidden /> Try again
          </button>
        </div>
      </div>
    </div>
  );
}
