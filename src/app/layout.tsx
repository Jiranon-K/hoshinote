import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/SessionProvider";
import { ToastProvider } from "../components/ui/toaster";
import AppShell from "@/components/layout/AppShell";
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
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
    other: {
      rel: 'icon',
      url: '/icon.png',
    },
  },
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
    creator: "@hoshinote",
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
        className={`${nunito.variable} antialiased min-h-screen font-nunito`}
      >
        <AuthProvider>
          <ToastProvider>
          <AppShell>
            {children}
          </AppShell>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
