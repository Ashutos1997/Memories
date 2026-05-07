import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const noto = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "기억 — Memories",
  description: "An infinite canvas for your memories.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${noto.variable}`}>
      <body className="font-noto touch-none">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
