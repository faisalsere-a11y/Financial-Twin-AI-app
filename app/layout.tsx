import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Financial Twin AI — See decisions before you make them",
    template: "%s | Financial Twin AI"
  },
  description: "Model your finances, compare life decisions, and understand the impact on cash flow, debt, risk, and goals with an explainable AI financial twin.",
  applicationName: "Financial Twin AI",
  category: "finance",
  keywords: [
    "financial planning",
    "financial simulation",
    "cash flow forecast",
    "AI financial assistant",
    "Saudi Arabia finance",
    "SAR budgeting"
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_SA",
    title: "Financial Twin AI — See decisions before you make them",
    description: "Compare financial futures with a model that shows its evidence and assumptions."
  },
  twitter: {
    card: "summary",
    title: "Financial Twin AI",
    description: "Model the financial future of a decision before money moves."
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f5" },
    { media: "(prefers-color-scheme: dark)", color: "#090d18" }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
