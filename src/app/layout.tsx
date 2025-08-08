import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/SessionProvider";
import { ToastProvider } from "../components/ui/toaster";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["blog", "nextjs", "typescript", "mongodb", "cms", "publishing"],
  authors: [
    {
      name: siteConfig.authors.default,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.authors.default,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@hoshilog",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} antialiased min-h-screen flex flex-col font-nunito`}
      >
        <AuthProvider>
          <ToastProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
