import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { IosInstallPrompt } from "@/components/ios-install-prompt";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coisinhas do Gu",
  description: "Gerenciamento do enxoval do Gustavo",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#6B9080",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Coisinhas do Gu" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${nunito.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
        <ServiceWorkerRegister />
        <IosInstallPrompt />
      </body>
    </html>
  );
}
