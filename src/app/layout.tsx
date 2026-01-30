import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Standard-Termine - Schulferien & Feiertage als Kalender",
  description: "Erstelle einen Kalender mit Schulferien und Feiertagen für dein Bundesland. Einfach als ICS-Datei herunterladen und importieren.",
  keywords: ["Schulferien", "Feiertage", "Kalender", "ICS", "Deutschland", "Bundesland"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
