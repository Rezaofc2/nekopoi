import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NekoPoi - Nonton Streaming",
  description: "Koleksi JAV, Hentai, dan Uncensored Subtitle Indonesia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased dark">
      <head>
        <link rel="icon" href="https://nekopoi.care/wp-content/uploads/2022/07/favicon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#1a1a2e]">{children}</body>
    </html>
  );
}
