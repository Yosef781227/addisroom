import { headers } from "next/headers";
import { parseLang, languageDirection } from "@/lib/i18n";
import type { Metadata } from "next";
import {
  Poppins,
  Geist_Mono,
  Noto_Sans_Arabic,
  Noto_Sans_Ethiopic,
} from "next/font/google";
import "./globals.css";
import "./villa-theme.css";
import "./dark-mode.css";
import { MotionProvider } from "@/components/motion/Reveal";

const geistSans = Poppins({
  variable: "--font-geist-sans",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const arabicFont = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  preload: false,
  display: "swap",
});
const ethiopicFont = Noto_Sans_Ethiopic({
  variable: "--font-ethiopic",
  subsets: ["ethiopic"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "AddisRoom — Find a rental home in Addis Ababa",
  description:
    "Find rental homes in Addis Ababa by location, monthly budget and amenities, with a map view and verified brokers.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = parseLang((await headers()).get("x-addisroom-lang"));
  return (
    <html
      lang={lang}
      dir={languageDirection(lang)}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${arabicFont.variable} ${ethiopicFont.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t;try{t=localStorage.getItem('addisroom-color-mode')}catch(e){}document.documentElement.dataset.theme=t==='dark'?'dark':'light'})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-slate-900">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
