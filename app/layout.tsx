import "./globals.css";

import {Analytics} from "@vercel/analytics/next";
import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";

import {Footer} from "@/components/Footer";
import {Header} from "@/components/Header";
import {I18nInitializer} from "@/components/I18nInitializer";
import {Providers} from "@/components/Providers";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GameHub",
  description:
      "GameHub — Play my web games and explore my projects in one place.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body className={`font-sans antialiased min-h-[100svh] flex flex-col`}>
        <Providers>
          <I18nInitializer/>
          <Header />
          <main className="flex-1 min-h-0">{children}</main>
          <Footer />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
