import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SetupBanner } from "@/components/layout/setup-banner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuildAfrica — Showcase proof of work",
  description:
    "A platform for African builders to showcase real products, SaaS apps, MVPs, and proof-of-work.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        {!isAdmin && <Navbar />}
        {isAdmin ? (
          children
        ) : (
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
            <SetupBanner />
            {children}
          </main>
        )}
        {!isAdmin && <Footer />}
      </body>
    </html>
  );
}
