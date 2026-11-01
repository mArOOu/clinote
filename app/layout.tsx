import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { OfflineIndicator } from "@/components/offline-indicator";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const serif = Source_Serif_4({ variable: "--font-serif", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Clinote", template: "%s · Clinote" },
  description: "A personal clinical reference library for study. Not validated clinical guidance.",
  applicationName: "Clinote",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Clinote",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.jpg", type: "image/jpeg" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#121413" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Inline script executed immediately before body renders to avoid theme flash (FOUC)
const themeScript = `(function(){try{var t=localStorage.getItem("clinote-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${serif.variable} h-full antialiased`}
    >
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <OfflineIndicator />
        {children}
      </body>
    </html>
  );
}
