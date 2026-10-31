import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clinote — Clinical Knowledge System",
    short_name: "Clinote",
    description: "A fast, structured personal clinical reference system for medical students and clinicians.",
    start_url: "/library",
    display: "standalone",
    background_color: "#fbfaf7",
    theme_color: "#0f766e",
    orientation: "any",
    categories: ["medical", "education", "reference"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
