"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

export type ThemeMode = "system" | "light" | "dark";

function getSnapshot(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const val = localStorage.getItem("clinote-theme");
  return val === "light" || val === "dark" ? val : "system";
}

function getServerSnapshot(): ThemeMode {
  return "system";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const cycle = () => {
    const next: ThemeMode = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    if (next === "system") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem("clinote-theme");
    } else {
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("clinote-theme", next);
    }
    // Notify current window listeners
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <button
      type="button"
      onClick={cycle}
      className={`theme-btn ${className ?? ""}`}
      title={`Theme: ${theme} (click to toggle)`}
      aria-label={`Current theme: ${theme}. Click to change.`}
    >
      {theme === "light" && <Sun size={15} aria-hidden />}
      {theme === "dark" && <Moon size={15} aria-hidden />}
      {theme === "system" && <Monitor size={15} aria-hidden />}
      <span className="theme-label">{theme}</span>
    </button>
  );
}
