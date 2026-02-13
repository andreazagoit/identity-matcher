import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Identity Matcher - OAuth Provider",
  description:
    "OAuth 2.1 Provider con AI Matching per l'ecosistema Matcher",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${inter.variable} dark`}
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>
          <Header />
          <div className="min-h-[calc(100vh-3.5rem)]">{children}</div>
          <Footer />
        </TooltipProvider>
      </body>
    </html>
  );
}
