import { ThemeToggle } from "@/components/ThemeToggle";
import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./villa-theme.css";
import "./color-theme.css";
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

export const metadata: Metadata = {
  title: "AddisRoom — Find a rental home in Addis Ababa",
  description:
    "Find rental homes in Addis Ababa by location, monthly budget and amenities, with a map view and verified brokers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t;try{t=localStorage.getItem('addisroom-theme')}catch(e){}document.documentElement.dataset.theme=t==='light'||t==='dark'?t:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <MotionProvider>{children}</MotionProvider>
        <ThemeToggle />
      </body>
    </html>
  );
}
