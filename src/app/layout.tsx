import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/sw-register";
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
  themeColor: "#7BA4D4",
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
      <body className={`${nunito.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
