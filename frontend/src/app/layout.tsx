import type { Metadata } from "next";
import { Rajdhani, Antonio, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import RootLayout from "@/components/layout/RootLayout";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const antonio = Antonio({
  variable: "--font-antonio",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NexSpark AI Growth OS",
  description: "4-Module AI Growth Operating System: GTM Strategist, Creative Executor, Meta & Google Ads, Performance Analyzer",
  keywords: ["AI", "Growth", "Marketing", "GTM", "Creative", "Advertising", "Analytics"],
  authors: [{ name: "NexSpark" }],
  creator: "NexSpark",
  publisher: "NexSpark",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#FF9C00",
  colorScheme: "dark",
  robots: "index, follow",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`
          ${rajdhani.variable}
          ${antonio.variable}
          ${jetbrainsMono.variable}
          antialiased font-primary
        `}
      >
        <RootLayout>
          {children}
        </RootLayout>
      </body>
    </html>
  );
}
