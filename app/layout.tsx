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
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <TooltipProvider>
          <div className="flex flex-col" style={{ minHeight: "100dvh" }}>
            <div className="bg-primary text-primary-foreground text-center text-xs font-medium py-1.5 px-4">
              🚧 Questa piattaforma è in <span className="font-bold">alpha</span> — funzionalità e dati possono cambiare senza preavviso.
            </div>
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
