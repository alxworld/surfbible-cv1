import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { headers } from "next/headers";
import Nav from "./components/Nav";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://surfbible.in"),
  title: {
    default: "SurfBible — Daily Bible Reading",
    template: "%s | SurfBible",
  },
  description: "Structured daily Bible reading plans for churches and individuals. Track your streak, read together, grow in the Word.",
  keywords: ["bible reading plan", "daily bible reading", "church bible study", "navigators plan", "bible streak"],
  openGraph: {
    type: "website",
    siteName: "SurfBible",
    locale: "en_US",
    url: "https://surfbible.in",
    title: "SurfBible — Daily Bible Reading",
    description: "Structured daily Bible reading plans for churches and individuals.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SurfBible — Daily Bible Reading",
    description: "Structured daily Bible reading plans for churches and individuals.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://surfbible.in" },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0f172a]">
        <ClerkProvider nonce={nonce}>
          <Nav />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
