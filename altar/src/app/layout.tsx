import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "A D M I N I S T R A T U M - Machine Spirit Altar",
  description: "Direct interface with the Omnissiah's blessed logic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} antialiased crt-flicker`}>
        <div className="crt-overlay" />
        {children}
      </body>
    </html>
  );
}
