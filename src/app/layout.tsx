import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Qalendr - Schulferien & Feiertage als Kalender",
  description: "Erstelle einen Kalender mit Schulferien, Feiertagen und besonderen Tagen. Einfach als ICS-Datei herunterladen und in Apple Kalender, Google Kalender oder Outlook importieren.",
  keywords: ["Schulferien", "Feiertage", "Kalender", "ICS", "Deutschland", "Bundesland", "Ferienkalender", "Kalender Download"],
  authors: [{ name: "Qalendr" }],
  creator: "Qalendr",
  metadataBase: new URL("https://qalendr.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://qalendr.com",
    siteName: "Qalendr",
    title: "Qalendr - Schulferien & Feiertage als Kalender",
    description: "Erstelle einen Kalender mit Schulferien, Feiertagen und besonderen Tagen. Einfach als ICS-Datei herunterladen und importieren.",
  },
  twitter: {
    card: "summary",
    title: "Qalendr - Schulferien & Feiertage als Kalender",
    description: "Erstelle einen Kalender mit Schulferien, Feiertagen und besonderen Tagen. Einfach als ICS-Datei herunterladen.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#161618" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
